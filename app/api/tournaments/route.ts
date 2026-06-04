import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tournaments, tournamentParticipants, rpsProfile } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id
}

export async function GET() {
  try {
    const allTournaments = await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.createdAt))
      .limit(50)

    return NextResponse.json(allTournaments)
  } catch (error) {
    console.error('[v0] GET /api/tournaments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, format, maxPlayers, entryFee } = body

    if (!name || !format || !maxPlayers || !entryFee) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const tournamentId = nanoid()
    const newTournament = await db
      .insert(tournaments)
      .values({
        id: tournamentId,
        creatorId: userId,
        name,
        description,
        format,
        maxPlayers: parseInt(maxPlayers),
        entryFee,
        status: 'open',
      })
      .returning()

    return NextResponse.json(newTournament[0], { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/tournaments error:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    )
  }
}
