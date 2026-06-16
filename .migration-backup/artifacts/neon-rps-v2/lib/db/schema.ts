import { pgTable, text, timestamp, integer, decimal, boolean, date, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: integer('expiresAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// RPS Game Profile
export const rpsProfile = pgTable('rps_profile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  walletAddress: text('walletAddress').notNull().unique(),
  totalWins: integer('totalWins').default(0),
  totalLosses: integer('totalLosses').default(0),
  totalWinnings: decimal('totalWinnings', { precision: 20, scale: 8 }).default('0'),
  referrerAddress: text('referrerAddress'),
  referralCount: integer('referralCount').default(0),
  referralEarnings: decimal('referralEarnings', { precision: 20, scale: 8 }).default('0'),
  battlePassLevel: integer('battlePassLevel').default(1),
  battlePassExp: integer('battlePassExp').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Tournaments
export const tournaments = pgTable('tournaments', {
  id: text('id').primaryKey(),
  creatorId: text('creatorId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  format: text('format').notNull(), // 'single-elimination' | 'round-robin'
  maxPlayers: integer('maxPlayers').notNull(),
  entryFee: decimal('entryFee', { precision: 20, scale: 8 }).notNull(),
  prizePool: decimal('prizePool', { precision: 20, scale: 8 }).default('0'),
  status: text('status').default('open'), // 'open' | 'in-progress' | 'completed'
  startTime: timestamp('startTime'),
  endTime: timestamp('endTime'),
  coverImage: text('coverImage'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const tournamentParticipants = pgTable('tournament_participants', {
  id: text('id').primaryKey(),
  tournamentId: text('tournamentId').notNull().references(() => tournaments.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  walletAddress: text('walletAddress').notNull(),
  status: text('status').default('joined'), // 'joined' | 'eliminated' | 'winner'
  seed: integer('seed'),
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  joinedAt: timestamp('joinedAt').notNull().defaultNow(),
})

export const tournamentMatches = pgTable('tournament_matches', {
  id: text('id').primaryKey(),
  tournamentId: text('tournamentId').notNull().references(() => tournaments.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),
  player1Id: text('player1Id').references(() => tournamentParticipants.id, { onDelete: 'cascade' }),
  player2Id: text('player2Id').references(() => tournamentParticipants.id, { onDelete: 'cascade' }),
  winnerId: text('winnerId').references(() => tournamentParticipants.id),
  gameHash: text('gameHash'),
  status: text('status').default('pending'), // 'pending' | 'in-progress' | 'completed'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  completedAt: timestamp('completedAt'),
})

// Daily Challenges
export const dailyChallenges = pgTable('daily_challenges', {
  id: text('id').primaryKey(),
  day: date('day').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirement: text('requirement').notNull(), // 'win-3-in-a-row' | 'play-with-10-opponents'
  target: integer('target').notNull(),
  rewardAmount: decimal('rewardAmount', { precision: 20, scale: 8 }).notNull(),
  nftRewardId: text('nftRewardId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const challengeProgress = pgTable('challenge_progress', {
  id: text('id').primaryKey(),
  challengeId: text('challengeId').notNull().references(() => dailyChallenges.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  progress: integer('progress').default(0),
  completed: boolean('completed').default(false),
  claimedAt: timestamp('claimedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Battle Pass
export const battlePass = pgTable('battle_pass', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tier: text('tier').default('free'), // 'free' | 'premium'
  level: integer('level').default(1),
  experience: integer('experience').default(0),
  startDate: timestamp('startDate').notNull().defaultNow(),
  endDate: timestamp('endDate'),
  premiumExpiresAt: timestamp('premiumExpiresAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const cosmeticItems = pgTable('cosmetic_items', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'move-animation' | 'sound-effect' | 'avatar-frame'
  name: text('name').notNull(),
  description: text('description'),
  battlePassLevel: integer('battlePassLevel'),
  priceUsd: decimal('priceUsd', { precision: 10, scale: 2 }),
  imageUrl: text('imageUrl'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const userCosmetics = pgTable('user_cosmetics', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  cosmeticId: text('cosmeticId').notNull().references(() => cosmeticItems.id),
  equipped: boolean('equipped').default(false),
  unlockedAt: timestamp('unlockedAt').notNull().defaultNow(),
})

// Referrals
export const referrals = pgTable('referrals', {
  id: text('id').primaryKey(),
  referrerId: text('referrerId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  refereeId: text('refereeId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  referralCode: text('referralCode').notNull().unique(),
  status: text('status').default('active'), // 'active' | 'used'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  usedAt: timestamp('usedAt'),
})

export const referralEarnings = pgTable('referral_earnings', {
  id: text('id').primaryKey(),
  referrerId: text('referrerId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  refereeId: text('refereeId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  gameId: text('gameId').notNull(),
  amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
  percentageShare: decimal('percentageShare', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Game History
export const gameHistory = pgTable('game_history', {
  id: text('id').primaryKey(),
  player1Id: text('player1Id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  player2Id: text('player2Id').notNull(),
  player1Address: text('player1Address').notNull(),
  player2Address: text('player2Address').notNull(),
  player1Move: text('player1Move'),
  player2Move: text('player2Move'),
  winner: text('winner'),
  wagerAmount: decimal('wagerAmount', { precision: 20, scale: 8 }),
  currency: text('currency'), // 'ETH' | 'USDC'
  contractHash: text('contractHash'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  completedAt: timestamp('completedAt'),
})

// Leaderboard
export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
  id: text('id').primaryKey(),
  rank: integer('rank').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  walletAddress: text('walletAddress').notNull(),
  totalWins: integer('totalWins').notNull(),
  totalWinnings: decimal('totalWinnings', { precision: 20, scale: 8 }).notNull(),
  period: text('period').notNull(), // 'all-time' | 'weekly' | 'monthly'
  snapshotDate: timestamp('snapshotDate').notNull().defaultNow(),
})

// User Settings
export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  soundEnabled: boolean('soundEnabled').default(true),
  musicEnabled: boolean('musicEnabled').default(true),
  volumeLevel: integer('volumeLevel').default(70),
  notificationsEnabled: boolean('notificationsEnabled').default(true),
  darkMode: boolean('darkMode').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Relations
export const userRelations = relations(user, ({ one, many }) => ({
  rpsProfile: one(rpsProfile),
  sessions: many(session),
  accounts: many(account),
  tournaments: many(tournaments),
  battlePass: one(battlePass),
  cosmetics: many(userCosmetics),
  referrals: many(referrals),
  gameHistory: many(gameHistory),
  settings: one(userSettings),
}))
