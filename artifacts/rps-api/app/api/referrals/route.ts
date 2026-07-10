import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rpsPlayers, rpsReferralRewards, rpsGames } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Get player
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
    const referralCode = player[0].referralCode

    // Get referral rewards earned by this player
    const earnedRewards = await db
      .select({
        id: rpsReferralRewards.id,
        refereeId: rpsReferralRewards.refereeId,
        rewardAmount: rpsReferralRewards.rewardAmount,
        status: rpsReferralRewards.status,
        createdAt: rpsReferralRewards.createdAt,
      })
      .from(rpsReferralRewards)
      .where(eq(rpsReferralRewards.referrerId, playerId))
      .orderBy(desc(rpsReferralRewards.createdAt))

    // Get referees
    const referredPlayers = await db
      .select()
      .from(rpsPlayers)
      .where(eq(rpsPlayers.referredById, playerId))

    // Calculate total earned
    const totalEarned = earnedRewards.reduce((sum, r) => sum + Number(r.rewardAmount), 0)

    return NextResponse.json({
      success: true,
      data: {
        referralCode: referralCode || 'NOT_SET',
        totalReferred: referredPlayers.length,
        totalEarned,
        pendingRewards: earnedRewards
          .filter((r) => r.status === 'pending')
          .reduce((sum, r) => sum + Number(r.rewardAmount), 0),
        referredPlayers: referredPlayers.map((p) => ({
          id: p.id,
          walletAddress: p.walletAddress,
          displayName: p.displayName,
          totalGames: p.totalGames,
          referredAt: p.createdAt,
        })),
        recentRewards: earnedRewards.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('[API] Referrals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referral data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, referralCode } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Get or create player
    let player = await db
      .select()
      .from(rpsPlayers)
      .where(eq(rpsPlayers.walletAddress, walletAddress))
      .limit(1)

    if (!player.length) {
      // Create new player
      const newCode = nanoid(8).toUpperCase()
      await db.insert(rpsPlayers).values({
        walletAddress,
        referralCode: newCode,
      })

      const created = await db
        .select()
        .from(rpsPlayers)
        .where(eq(rpsPlayers.walletAddress, walletAddress))
        .limit(1)
      player = created
    }

    // If referral code provided, link to referrer
    if (referralCode && !player[0].referredById) {
      const referrer = await db
        .select()
        .from(rpsPlayers)
        .where(eq(rpsPlayers.referralCode, referralCode))
        .limit(1)

      if (referrer.length) {
        // Update player with referrer ID
        // This would require an UPDATE mutation, which we'll handle in actions
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: player[0].id,
        walletAddress: player[0].walletAddress,
        referralCode: player[0].referralCode,
      },
    })
  } catch (error) {
    console.error('[API] Create referral error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    )
  }
}
