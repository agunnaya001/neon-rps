import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  rpsTournaments,
  rpsTournamentParticipants,
  rpsTournamentMatches,
  rpsPlayers,
} from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

const CreateTournamentSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  tournamentType: z.enum(['single_elimination', 'round_robin']),
  maxPlayers: z.number().int().min(4).max(128),
  entryFee: z.string(), // BigInt as string
  prizePool: z.string(),
  creatorWallet: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'registration'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const tournaments = await db
      .select({
        id: rpsTournaments.id,
        name: rpsTournaments.name,
        description: rpsTournaments.description,
        tournamentType: rpsTournaments.tournamentType,
        status: rpsTournaments.status,
        maxPlayers: rpsTournaments.maxPlayers,
        entryFee: rpsTournaments.entryFee,
        prizePool: rpsTournaments.prizePool,
        createdAt: rpsTournaments.createdAt,
        startedAt: rpsTournaments.startedAt,
      })
      .from(rpsTournaments)
      .where(eq(rpsTournaments.status, status as any))
      .orderBy(desc(rpsTournaments.createdAt))
      .limit(limit)
      .offset(offset)

    // Get participant counts for each tournament
    const enrichedTournaments = await Promise.all(
      tournaments.map(async (t) => {
        const participants = await db
          .select({ count: db.count() })
          .from(rpsTournamentParticipants)
          .where(eq(rpsTournamentParticipants.tournamentId, t.id))

        return {
          ...t,
          participantCount: participants[0]?.count || 0,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedTournaments,
      pagination: { page, limit },
    })
  } catch (error) {
    console.error('[API] Tournaments GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CreateTournamentSchema.parse(body)

    // Get creator
    const creator = await db
      .select()
      .from(rpsPlayers)
      .where(eq(rpsPlayers.walletAddress, validated.creatorWallet))
      .limit(1)

    if (!creator.length) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    // Create tournament
    const tournament = await db
      .insert(rpsTournaments)
      .values({
        name: validated.name,
        description: validated.description,
        tournamentType: validated.tournamentType as any,
        status: 'registration',
        maxPlayers: validated.maxPlayers,
        entryFee: BigInt(validated.entryFee),
        prizePool: BigInt(validated.prizePool),
        creatorId: creator[0].id,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: tournament[0],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Tournaments POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tournament' },
      { status: 500 }
    )
  }
}
