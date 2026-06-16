import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { referrals, referralEarnings, rpsProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id
}

function generateReferralCode() {
  return `REF_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get referral code for this user
    const code = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .limit(1)

    // Get referral earnings
    const earnings = await db
      .select()
      .from(referralEarnings)
      .where(eq(referralEarnings.referrerId, userId))

    const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0)

    return NextResponse.json({
      referralCode: code[0]?.referralCode,
      totalEarnings,
      totalReferrals: earnings.length,
      earnings: earnings.slice(0, 10),
    })
  } catch (error) {
    console.error('[v0] GET /api/referrals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
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
    const { action } = body

    if (action === 'create-code') {
      // Check if referral code already exists
      const existing = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, userId))
        .limit(1)

      if (existing.length) {
        return NextResponse.json({
          referralCode: existing[0].referralCode,
        })
      }

      const referralCode = generateReferralCode()
      const newReferral = await db
        .insert(referrals)
        .values({
          id: `ref_${Date.now()}`,
          referrerId: userId,
          refereeId: userId, // Placeholder, will be updated when referee joins
          referralCode,
          status: 'active',
        })
        .returning()

      return NextResponse.json({
        referralCode: newReferral[0].referralCode,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] POST /api/referrals error:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}
