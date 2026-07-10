import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rpsPlayers, rpsPlayerStats } from '@/lib/db/schema'
import { desc, eq, gt, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const timeframe = searchParams.get('timeframe') || 'all' // all, week, month
    const metric = searchParams.get('metric') || 'win_rate' // win_rate, earnings, volume

    const offset = (page - 1) * limit

    let orderByField
    if (metric === 'earnings') {
      orderByField = desc(rpsPlayers.totalEarnings)
    } else if (metric === 'volume') {
      orderByField = desc(rpsPlayerStats.totalVolume)
    } else {
      orderByField = desc(rpsPlayerStats.winRate)
    }

    const query = db
      .select({
        id: rpsPlayers.id,
        walletAddress: rpsPlayers.walletAddress,
        displayName: rpsPlayers.displayName,
        avatarUrl: rpsPlayers.avatarUrl,
        totalGames: rpsPlayers.totalGames,
        totalWins: rpsPlayers.totalWins,
        totalEarnings: rpsPlayers.totalEarnings,
        winRate: rpsPlayerStats.winRate,
        currentStreak: rpsPlayerStats.currentStreak,
        bestStreak: rpsPlayerStats.bestStreak,
        totalVolume: rpsPlayerStats.totalVolume,
      })
      .from(rpsPlayers)
      .innerJoin(rpsPlayerStats, eq(rpsPlayers.id, rpsPlayerStats.playerId))

    // Add timeframe filter
    if (timeframe === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      query.where(
        and(
          gt(rpsPlayerStats.lastGameAt, weekAgo),
          gt(rpsPlayerStats.gamesThisWeek, 0)
        )
      )
    } else if (timeframe === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      query.where(
        and(
          gt(rpsPlayerStats.lastGameAt, monthAgo),
          gt(rpsPlayerStats.gamesThisMonth, 0)
        )
      )
    }

    const leaderboard = await query
      .orderBy(orderByField)
      .limit(limit)
      .offset(offset)

    // Get total count
    const countResult = await db
      .select({ count: db.count() })
      .from(rpsPlayerStats)

    const total = countResult[0]?.count || 0

    return NextResponse.json({
      success: true,
      data: leaderboard.map((entry, index) => ({
        rank: offset + index + 1,
        ...entry,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[API] Leaderboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
