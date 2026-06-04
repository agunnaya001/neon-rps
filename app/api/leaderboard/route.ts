import { db } from '@/lib/db'
import { rpsProfile, leaderboardSnapshots } from '@/lib/db/schema'
import { eq, desc, limit } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get('period') || 'all-time'

    // Get leaderboard from snapshots
    const leaderboard = await db
      .select({
        rank: leaderboardSnapshots.rank,
        userId: leaderboardSnapshots.userId,
        walletAddress: leaderboardSnapshots.walletAddress,
        totalWins: leaderboardSnapshots.totalWins,
        totalWinnings: leaderboardSnapshots.totalWinnings,
      })
      .from(leaderboardSnapshots)
      .where(eq(leaderboardSnapshots.period, period))
      .orderBy(leaderboardSnapshots.rank)
      .limit(100)

    // If no snapshots, generate from rpsProfile
    if (!leaderboard.length) {
      const profiles = await db
        .select()
        .from(rpsProfile)
        .orderBy(desc(rpsProfile.totalWins))
        .limit(100)

      return NextResponse.json({
        period,
        data: profiles.map((p, idx) => ({
          rank: idx + 1,
          userId: p.userId,
          walletAddress: p.walletAddress,
          totalWins: p.totalWins,
          totalWinnings: p.totalWinnings,
        })),
      })
    }

    return NextResponse.json({
      period,
      data: leaderboard,
    })
  } catch (error) {
    console.error('[v0] GET /api/leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
