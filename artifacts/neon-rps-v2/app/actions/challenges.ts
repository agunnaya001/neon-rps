'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dailyChallenges, challengeProgress } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getDailyChallenge() {
  const today = new Date().toISOString().split('T')[0]
  
  const challenge = await db.query.dailyChallenges.findFirst({
    where: eq(dailyChallenges.day, today as any),
  })
  
  return challenge
}

export async function getChallengeProgress(challengeId: string) {
  const userId = await getUserId()
  
  const progress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.challengeId, challengeId),
      eq(challengeProgress.userId, userId)
    ),
  })
  
  return progress
}

export async function updateChallengeProgress(
  challengeId: string,
  incrementBy: number
) {
  const userId = await getUserId()
  
  let progress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.challengeId, challengeId),
      eq(challengeProgress.userId, userId)
    ),
  })
  
  if (!progress) {
    const newProgress = {
      id: `progress_${challengeId}_${userId}`,
      challengeId,
      userId,
      progress: incrementBy,
      completed: false,
      claimedAt: null,
      createdAt: new Date(),
    }
    
    await db.insert(challengeProgress).values(newProgress)
    progress = newProgress
  } else {
    const newProgressValue = progress.progress + incrementBy
    await db.update(challengeProgress)
      .set({ progress: newProgressValue })
      .where(eq(challengeProgress.id, progress.id))
    
    progress = { ...progress, progress: newProgressValue }
  }
  
  // Check if challenge completed
  const challenge = await db.query.dailyChallenges.findFirst({
    where: eq(dailyChallenges.id, challengeId),
  })
  
  if (challenge && progress.progress >= challenge.target && !progress.completed) {
    await db.update(challengeProgress)
      .set({ completed: true })
      .where(eq(challengeProgress.id, progress.id))
  }
  
  return progress
}

export async function claimChallenge(challengeId: string) {
  const userId = await getUserId()
  
  const progress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.challengeId, challengeId),
      eq(challengeProgress.userId, userId)
    ),
  })
  
  if (!progress || !progress.completed) {
    throw new Error('Challenge not completed')
  }
  
  if (progress.claimedAt) {
    throw new Error('Challenge already claimed')
  }
  
  const challenge = await db.query.dailyChallenges.findFirst({
    where: eq(dailyChallenges.id, challengeId),
  })
  
  if (!challenge) throw new Error('Challenge not found')
  
  // Claim reward
  await db.update(challengeProgress)
    .set({ claimedAt: new Date() })
    .where(eq(challengeProgress.id, progress.id))
  
  return {
    success: true,
    reward: challenge.rewardAmount,
  }
}
