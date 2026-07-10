import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rpsAchievements, rpsPlayerAchievements, rpsPlayers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      // Return all achievements
      const achievements = await db.select().from(rpsAchievements)
      return NextResponse.json({
        success: true,
        data: achievements,
      })
    }

    // Get achievements for specific player
    const player = await db
      .select()
      .from(rpsPlayers)
      .where(eq(rpsPlayers.walletAddress, walletAddress))
      .limit(1)

    if (!player.length) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    const playerId = player[0].id

    // Get all achievements with player unlock status
    const achievementsWithStatus = await db
      .select({
        id: rpsAchievements.id,
        name: rpsAchievements.name,
        description: rpsAchievements.description,
        iconUrl: rpsAchievements.iconUrl,
        rarity: rpsAchievements.rarity,
        unlockedAt: rpsPlayerAchievements.unlockedAt,
        isUnlocked: rpsPlayerAchievements.id,
      })
      .from(rpsAchievements)
      .leftJoin(
        rpsPlayerAchievements,
        eq(rpsAchievements.id, rpsPlayerAchievements.achievementId)
      )
      .where(eq(rpsPlayerAchievements.playerId, playerId))

    const unlockedAchievements = await db
      .select()
      .from(rpsPlayerAchievements)
      .where(eq(rpsPlayerAchievements.playerId, playerId))

    return NextResponse.json({
      success: true,
      data: {
        total: (await db.select().from(rpsAchievements)).length,
        unlocked: unlockedAchievements.length,
        achievements: achievementsWithStatus.map((ach) => ({
          id: ach.id,
          name: ach.name,
          description: ach.description,
          iconUrl: ach.iconUrl,
          rarity: ach.rarity,
          unlocked: !!ach.isUnlocked,
          unlockedAt: ach.unlockedAt,
        })),
      },
    })
  } catch (error) {
    console.error('[API] Achievements error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
