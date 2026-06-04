'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tournaments, tournamentParticipants, tournamentMatches } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { v4 as uuid } from 'crypto'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createTournament(data: {
  name: string
  description: string
  format: 'single-elimination' | 'round-robin'
  maxPlayers: number
  entryFee: string
  coverImage?: string
}) {
  const userId = await getUserId()
  
  const tournament = {
    id: `tournament_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    creatorId: userId,
    name: data.name,
    description: data.description,
    format: data.format,
    maxPlayers: data.maxPlayers,
    entryFee: data.entryFee,
    prizePool: '0',
    status: 'open' as const,
    coverImage: data.coverImage,
    createdAt: new Date(),
    updatedAt: new Date(),
    startTime: null,
    endTime: null,
  }
  
  await db.insert(tournaments).values(tournament)
  return tournament
}

export async function getTournaments(limit = 50) {
  return db.query.tournaments.findMany({
    orderBy: desc(tournaments.createdAt),
    limit,
    with: {
      creator: true,
      participants: true,
    },
  })
}

export async function getTournamentById(tournamentId: string) {
  return db.query.tournaments.findFirst({
    where: eq(tournaments.id, tournamentId),
    with: {
      creator: true,
      participants: {
        with: {
          user: true,
        },
      },
      matches: {
        with: {
          player1: true,
          player2: true,
          winner: true,
        },
      },
    },
  })
}

export async function joinTournament(tournamentId: string, walletAddress: string) {
  const userId = await getUserId()
  
  const tournament = await db.query.tournaments.findFirst({
    where: eq(tournaments.id, tournamentId),
  })
  
  if (!tournament) throw new Error('Tournament not found')
  if (tournament.status !== 'open') throw new Error('Tournament is not open')
  
  // Check if already joined
  const existing = await db.query.tournamentParticipants.findFirst({
    where: and(
      eq(tournamentParticipants.tournamentId, tournamentId),
      eq(tournamentParticipants.userId, userId)
    ),
  })
  
  if (existing) throw new Error('Already joined tournament')
  
  const participant = {
    id: `participant_${tournamentId}_${userId}`,
    tournamentId,
    userId,
    walletAddress,
    status: 'joined' as const,
    wins: 0,
    losses: 0,
    seed: null,
    joinedAt: new Date(),
  }
  
  await db.insert(tournamentParticipants).values(participant)
  return participant
}

export async function startTournament(tournamentId: string) {
  const userId = await getUserId()
  
  const tournament = await db.query.tournaments.findFirst({
    where: eq(tournaments.id, tournamentId),
  })
  
  if (!tournament) throw new Error('Tournament not found')
  if (tournament.creatorId !== userId) throw new Error('Unauthorized')
  
  await db.update(tournaments)
    .set({
      status: 'in-progress',
      startTime: new Date(),
    })
    .where(eq(tournaments.id, tournamentId))
  
  // Generate bracket/matches
  const participants = await db.query.tournamentParticipants.findMany({
    where: eq(tournamentParticipants.tournamentId, tournamentId),
  })
  
  if (tournament.format === 'single-elimination') {
    await generateSingleEliminationBracket(tournamentId, participants)
  }
  
  return true
}

async function generateSingleEliminationBracket(
  tournamentId: string,
  participants: typeof tournamentParticipants.$inferSelect[]
) {
  const shuffled = participants.sort(() => Math.random() - 0.5)
  
  // Create first round matches
  for (let i = 0; i < shuffled.length; i += 2) {
    const match = {
      id: `match_${tournamentId}_${i}`,
      tournamentId,
      round: 1,
      player1Id: shuffled[i]?.id,
      player2Id: shuffled[i + 1]?.id || null,
      winnerId: null,
      gameHash: null,
      status: 'pending' as const,
      createdAt: new Date(),
      completedAt: null,
    }
    
    await db.insert(tournamentMatches).values(match)
  }
}

export async function completeMatch(matchId: string, winnerId: string) {
  const match = await db.query.tournamentMatches.findFirst({
    where: eq(tournamentMatches.id, matchId),
  })
  
  if (!match) throw new Error('Match not found')
  
  await db.update(tournamentMatches)
    .set({
      winnerId,
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(tournamentMatches.id, matchId))
  
  // Update participant wins/losses
  const winner = await db.query.tournamentParticipants.findFirst({
    where: eq(tournamentParticipants.id, winnerId),
  })
  
  if (winner) {
    await db.update(tournamentParticipants)
      .set({ wins: winner.wins + 1 })
      .where(eq(tournamentParticipants.id, winnerId))
  }
  
  return true
}
