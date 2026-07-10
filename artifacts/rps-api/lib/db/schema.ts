import { pgTable, serial, text, bigint, integer, decimal, timestamp, boolean, uuid, check, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Import the Better Auth tables from neon_auth schema
// These are already created by Better Auth setup

// RPS Game specific tables
export const rpsPlayers = pgTable(
  'rps_players',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').notNull().unique(),
    walletAddress: text('wallet_address').notNull().unique(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    totalGames: integer('total_games').default(0),
    totalWins: integer('total_wins').default(0),
    totalLosses: integer('total_losses').default(0),
    totalTies: integer('total_ties').default(0),
    totalEarnings: bigint('total_earnings').default(0n),
    totalSpent: bigint('total_spent').default(0n),
    referralCode: text('referral_code').unique(),
    referredById: integer('referred_by_id').references(() => rpsPlayers.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_rps_players_wallet').on(table.walletAddress),
    index('idx_rps_players_referral').on(table.referralCode),
  ]
)

export const rpsGames = pgTable(
  'rps_games',
  {
    id: serial('id').primaryKey(),
    onChainGameId: bigint('on_chain_game_id').notNull().unique(),
    contractAddress: text('contract_address').notNull(),
    gameType: text('game_type', { enum: ['single', 'best_of_three'] }).notNull(),
    player1Id: integer('player1_id').references(() => rpsPlayers.id),
    player2Id: integer('player2_id').references(() => rpsPlayers.id),
    betAmount: bigint('bet_amount').notNull(),
    winnerId: integer('winner_id').references(() => rpsPlayers.id),
    feeAmount: bigint('fee_amount').default(0n),
    payoutAmount: bigint('payout_amount'),
    status: text('status', { enum: ['active', 'completed', 'cancelled', 'disputed'] }).default('active'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check('valid_status', `"status" IN ('active', 'completed', 'cancelled', 'disputed')`),
    index('idx_rps_games_player1').on(table.player1Id),
    index('idx_rps_games_player2').on(table.player2Id),
    index('idx_rps_games_winner').on(table.winnerId),
    index('idx_rps_games_status').on(table.status),
  ]
)

export const rpsPlayerStats = pgTable(
  'rps_player_stats',
  {
    id: serial('id').primaryKey(),
    playerId: integer('player_id').notNull().unique().references(() => rpsPlayers.id, { onDelete: 'cascade' }),
    winRate: decimal('win_rate', { precision: 5, scale: 2 }).default('0.00'),
    currentStreak: integer('current_streak').default(0),
    bestStreak: integer('best_streak').default(0),
    avgPotSize: bigint('avg_pot_size').default(0n),
    totalVolume: bigint('total_volume').default(0n),
    gamesThisWeek: integer('games_this_week').default(0),
    gamesThisMonth: integer('games_this_month').default(0),
    lastGameAt: timestamp('last_game_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_rps_stats_winrate').on(table.winRate),
  ]
)

export const rpsAchievements = pgTable(
  'rps_achievements',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    iconUrl: text('icon_url'),
    rarity: text('rarity', { enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
)

export const rpsPlayerAchievements = pgTable(
  'rps_player_achievements',
  {
    id: serial('id').primaryKey(),
    playerId: integer('player_id').notNull().references(() => rpsPlayers.id, { onDelete: 'cascade' }),
    achievementId: integer('achievement_id').notNull().references(() => rpsAchievements.id),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique('unique_player_achievement').on(table.playerId, table.achievementId),
  ]
)

export const rpsReferralRewards = pgTable(
  'rps_referral_rewards',
  {
    id: serial('id').primaryKey(),
    referrerId: integer('referrer_id').notNull().references(() => rpsPlayers.id, { onDelete: 'cascade' }),
    refereeId: integer('referee_id').notNull().references(() => rpsPlayers.id, { onDelete: 'cascade' }),
    gameId: integer('game_id').notNull().references(() => rpsGames.id),
    rewardAmount: bigint('reward_amount').notNull(),
    rewardType: text('reward_type', { enum: ['1pct_winnings', 'flat_bonus'] }).default('1pct_winnings'),
    status: text('status', { enum: ['pending', 'completed', 'failed'] }).default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    unique('unique_referral_game').on(table.referrerId, table.refereeId, table.gameId),
  ]
)

export const rpsTournaments = pgTable(
  'rps_tournaments',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    tournamentType: text('tournament_type', { enum: ['single_elimination', 'round_robin'] }).default('single_elimination'),
    status: text('status', { enum: ['registration', 'in_progress', 'completed', 'cancelled'] }).default('registration'),
    maxPlayers: integer('max_players').notNull(),
    entryFee: bigint('entry_fee').notNull(),
    prizePool: bigint('prize_pool').notNull(),
    creatorId: integer('creator_id').references(() => rpsPlayers.id),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_rps_tournament_status').on(table.status),
  ]
)

export const rpsTournamentParticipants = pgTable(
  'rps_tournament_participants',
  {
    id: serial('id').primaryKey(),
    tournamentId: integer('tournament_id').notNull().references(() => rpsTournaments.id, { onDelete: 'cascade' }),
    playerId: integer('player_id').notNull().references(() => rpsPlayers.id),
    seed: integer('seed'),
    status: text('status', { enum: ['registered', 'active', 'eliminated', 'winner'] }).default('registered'),
    placement: integer('placement'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique('unique_tournament_player').on(table.tournamentId, table.playerId),
  ]
)

export const rpsTournamentMatches = pgTable(
  'rps_tournament_matches',
  {
    id: serial('id').primaryKey(),
    tournamentId: integer('tournament_id').notNull().references(() => rpsTournaments.id, { onDelete: 'cascade' }),
    gameId: integer('game_id').references(() => rpsGames.id),
    player1Id: integer('player1_id').notNull().references(() => rpsPlayers.id),
    player2Id: integer('player2_id').references(() => rpsPlayers.id),
    winnerId: integer('winner_id').references(() => rpsPlayers.id),
    roundNumber: integer('round_number').notNull(),
    matchNumber: integer('match_number').notNull(),
    status: text('status', { enum: ['pending', 'in_progress', 'completed'] }).default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_rps_tournament_matches').on(table.tournamentId, table.roundNumber),
  ]
)

// Relations
export const rpsPlayersRelations = relations(rpsPlayers, ({ many, one }) => ({
  stats: many(rpsPlayerStats),
  achievements: many(rpsPlayerAchievements),
  gamesAsPlayer1: many(rpsGames, { relationName: 'player1' }),
  gamesAsPlayer2: many(rpsGames, { relationName: 'player2' }),
  winsAsWinner: many(rpsGames, { relationName: 'winner' }),
  referredBy: one(rpsPlayers, { fields: [rpsPlayers.referredById], references: [rpsPlayers.id] }),
  referrals: many(rpsPlayers),
}))

export const rpsPlayerStatsRelations = relations(rpsPlayerStats, ({ one }) => ({
  player: one(rpsPlayers, { fields: [rpsPlayerStats.playerId], references: [rpsPlayers.id] }),
}))

export const rpsGamesRelations = relations(rpsGames, ({ one, many }) => ({
  player1: one(rpsPlayers, { fields: [rpsGames.player1Id], references: [rpsPlayers.id] }),
  player2: one(rpsPlayers, { fields: [rpsGames.player2Id], references: [rpsPlayers.id] }),
  winner: one(rpsPlayers, { fields: [rpsGames.winnerId], references: [rpsPlayers.id] }),
  referralRewards: many(rpsReferralRewards),
}))
