import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rpsAchievements, rpsPlayerAchievements, rpsPlayers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    const achievements = await db.select().from(rpsAchievements)

    if (!wallet) {
      return NextResponse.json({
        success: true,
        data: achievements,
      })
    }

    // Get player achievements
    const player = await db.select().from(rpsPlayers).where(eq(rpsPlayers.walletAddress, wallet)).limit(1)

    if (!player.length) {
      return NextResponse.json({
        success: true,
        data: achievements.map(a => ({ ...a, unlocked: false })),
      })
    }

    const playerId = player[0].id
    const playerAchievements = await db
      .select({ achievementId: rpsPlayerAchievements.achievementId })
      .from(rpsPlayerAchievements)
      .where(eq(rpsPlayerAchievements.playerId, playerId))

    const unlockedIds = new Set(playerAchievements.map(pa => pa.achievementId))

    return NextResponse.json({
      success: true,
      data: achievements.map(a => ({
        ...a,
        unlocked: unlockedIds.has(a.id),
      })),
    })
  } catch (error) {
    console.error('[API] Achievements error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
