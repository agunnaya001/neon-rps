import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rpsGames, rpsPlayers } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const RecordGameSchema = z.object({
  onChainGameId: z.string(),
  contractAddress: z.string(),
  gameType: z.enum(['single', 'best_of_three']),
  player1Wallet: z.string(),
  player2Wallet: z.string().optional(),
  betAmount: z.string(),
  winnerWallet: z.string().optional(),
  feeAmount: z.string().optional(),
  payoutAmount: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const player = await db
      .select()
      .from(rpsPlayers)
      .where(eq(rpsPlayers.walletAddress, wallet))
      .limit(1)

    if (!player.length) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    const playerId = player[0].id

    // Get games where player participated
    const games = await db
      .select({
        id: rpsGames.id,
        onChainGameId: rpsGames.onChainGameId,
        gameType: rpsGames.gameType,
        betAmount: rpsGames.betAmount,
        payoutAmount: rpsGames.payoutAmount,
        feeAmount: rpsGames.feeAmount,
        status: rpsGames.status,
        completedAt: rpsGames.completedAt,
        player1: rpsPlayers.walletAddress,
      })
      .from(rpsGames)
      .leftJoin(rpsPlayers, eq(rpsGames.player1Id, rpsPlayers.id))
      .where(
        eq(rpsGames.player1Id, playerId)
      )
      .orderBy(desc(rpsGames.completedAt))
      .limit(limit)
      .offset(offset)

    const total = (
      await db
        .select({ count: db.count() })
        .from(rpsGames)
        .where(eq(rpsGames.player1Id, playerId))
    )[0]?.count || 0

    return NextResponse.json({
      success: true,
      data: games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[API] Games GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = RecordGameSchema.parse(body)

    // Get or create players
    const getOrCreatePlayer = async (wallet: string) => {
      let player = await db
        .select()
        .from(rpsPlayers)
        .where(eq(rpsPlayers.walletAddress, wallet))
        .limit(1)

      if (!player.length) {
        const result = await db
          .insert(rpsPlayers)
          .values({ walletAddress: wallet })
          .returning()
        return result[0]
      }
      return player[0]
    }

    const player1 = await getOrCreatePlayer(validated.player1Wallet)
    const player2 = validated.player2Wallet
      ? await getOrCreatePlayer(validated.player2Wallet)
      : null

    let winnerId: number | null = null
    if (validated.winnerWallet) {
      const winner = await getOrCreatePlayer(validated.winnerWallet)
      winnerId = winner.id
    }

    // Record the game
    const game = await db
      .insert(rpsGames)
      .values({
        onChainGameId: BigInt(validated.onChainGameId),
        contractAddress: validated.contractAddress,
        gameType: validated.gameType,
        player1Id: player1.id,
        player2Id: player2?.id || null,
        betAmount: BigInt(validated.betAmount),
        winnerId,
        feeAmount: validated.feeAmount ? BigInt(validated.feeAmount) : 0n,
        payoutAmount: validated.payoutAmount ? BigInt(validated.payoutAmount) : null,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: game[0],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Games POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record game' },
      { status: 500 }
    )
  }
}
