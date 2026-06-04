'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameHistory, referralEarnings, rpsProfile } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function recordGameResult(data: {
  player2Id: string
  player1Address: string
  player2Address: string
  winner: string // 'draw' | player address
  wagerAmount: string
  currency: 'ETH' | 'USDC'
  contractHash: string
}) {
  const userId = await getUserId()
  
  const game = {
    id: `game_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    player1Id: userId,
    player2Id: data.player2Id,
    player1Address: data.player1Address,
    player2Address: data.player2Address,
    winner: data.winner,
    wagerAmount: data.wagerAmount,
    currency: data.currency,
    contractHash: data.contractHash,
    createdAt: new Date(),
    completedAt: new Date(),
    player1Move: null,
    player2Move: null,
  }
  
  await db.insert(gameHistory).values(game)
  
  // Update user stats
  const userProfile = await db.query.rpsProfile.findFirst({
    where: eq(rpsProfile.userId, userId),
  })
  
  if (userProfile) {
    const isWinner = data.winner === data.player1Address
    const wagerBigInt = BigInt(parseFloat(data.wagerAmount) * 1e8) // Assuming 8 decimals
    
    if (isWinner) {
      await db.update(rpsProfile)
        .set({
          totalWins: userProfile.totalWins + 1,
          totalWinnings: (BigInt(userProfile.totalWinnings || '0') + wagerBigInt).toString(),
        })
        .where(eq(rpsProfile.userId, userId))
    } else {
      await db.update(rpsProfile)
        .set({
          totalLosses: userProfile.totalLosses + 1,
        })
        .where(eq(rpsProfile.userId, userId))
    }
    
    // Handle referral earnings (3% to referrer)
    if (userProfile.referrerAddress && isWinner) {
      const referralAmount = (wagerBigInt * 3n) / 100n
      const referrerProfile = await db.query.rpsProfile.findFirst({
        where: eq(rpsProfile.walletAddress, userProfile.referrerAddress),
      })
      
      if (referrerProfile) {
        // Record referral earning
        await db.insert(referralEarnings).values({
          id: `ref_earning_${Date.now()}`,
          referrerId: referrerProfile.userId,
          refereeId: userId,
          gameId: game.id,
          amount: referralAmount.toString(),
          percentageShare: '3',
          createdAt: new Date(),
        })
        
        // Update referrer's total
        await db.update(rpsProfile)
          .set({
            referralEarnings: (BigInt(referrerProfile.referralEarnings || '0') + referralAmount).toString(),
          })
          .where(eq(rpsProfile.userId, referrerProfile.userId))
      }
    }
  }
  
  return game
}

export async function getGameHistory(limit = 50) {
  const userId = await getUserId()
  
  return db.query.gameHistory.findMany({
    where: (games) => eq(games.player1Id, userId),
    orderBy: desc(gameHistory.createdAt),
    limit,
  })
}

export async function getLeaderboard(period: 'all-time' | 'weekly' | 'monthly' = 'all-time', limit = 100) {
  const profiles = await db.query.rpsProfile.findMany({
    orderBy: desc(rpsProfile.totalWinnings),
    limit,
  })
  
  return profiles.map((p, idx) => ({
    rank: idx + 1,
    ...p,
  }))
}
