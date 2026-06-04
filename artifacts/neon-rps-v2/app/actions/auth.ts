'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, rpsProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { v4 as uuid } from 'crypto'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user || null
  } catch {
    return null
  }
}

export async function getUserProfile() {
  const userId = await getUserId()
  const profile = await db.query.rpsProfile.findFirst({
    where: eq(rpsProfile.userId, userId),
  })
  return profile
}

export async function createRpsProfile(walletAddress: string) {
  const userId = await getUserId()
  
  // Check if profile already exists
  const existing = await db.query.rpsProfile.findFirst({
    where: eq(rpsProfile.userId, userId),
  })
  
  if (existing) return existing
  
  const profile = {
    id: `profile_${userId}_${Date.now()}`,
    userId,
    walletAddress,
    totalWins: 0,
    totalLosses: 0,
    totalWinnings: '0',
    referralCount: 0,
    referralEarnings: '0',
    battlePassLevel: 1,
    battlePassExp: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  await db.insert(rpsProfile).values(profile)
  return profile
}

export async function signOutUser() {
  await auth.api.signOut({ headers: await headers() })
}
