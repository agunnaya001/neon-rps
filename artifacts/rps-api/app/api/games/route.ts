import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rpsGames, rpsPlayers } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

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
        { success: true, data: [], pagination: { page, limit, hasMore: false } }
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
      })
      .from(rpsGames)
      .where(eq(rpsGames.player1Id, playerId))
      .orderBy(desc(rpsGames.completedAt))
      .limit(limit + 1)
      .offset(offset)

    const hasMore = games.length > limit
    const results = hasMore ? games.slice(0, limit) : games

    return NextResponse.json({
      success: true,
      data: results,
      pagination: { page, limit, hasMore },
    })
  } catch (error) {
    console.error('[API] Games GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
