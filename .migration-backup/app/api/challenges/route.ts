import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dailyChallenges, challengeProgress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()
    
    const today = new Date().toISOString().split('T')[0]
    const challenge = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.day, today))
      .limit(1)

    if (!challenge.length) {
      return NextResponse.json({
        challenge: null,
        progress: null,
      })
    }

    let progress = null
    if (userId) {
      const userProgress = await db
        .select()
        .from(challengeProgress)
        .where(
          eq(challengeProgress.challengeId, challenge[0].id) &&
          eq(challengeProgress.userId, userId)
        )
        .limit(1)
      progress = userProgress[0] || null
    }

    return NextResponse.json({
      challenge: challenge[0],
      progress,
    })
  } catch (error) {
    console.error('[v0] GET /api/challenges error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
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
    const { challengeId, progress } = body

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID required' },
        { status: 400 }
      )
    }

    const existing = await db
      .select()
      .from(challengeProgress)
      .where(
        eq(challengeProgress.challengeId, challengeId) &&
        eq(challengeProgress.userId, userId)
      )
      .limit(1)

    let updated
    if (existing.length) {
      updated = await db
        .update(challengeProgress)
        .set({
          progress: (existing[0].progress || 0) + (progress || 1),
        })
        .where(eq(challengeProgress.id, existing[0].id))
        .returning()
    } else {
      updated = await db
        .insert(challengeProgress)
        .values({
          id: `cp_${Date.now()}`,
          challengeId,
          userId,
          progress: progress || 1,
        })
        .returning()
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('[v0] POST /api/challenges error:', error)
    return NextResponse.json(
      { error: 'Failed to update challenge' },
      { status: 500 }
    )
  }
}
