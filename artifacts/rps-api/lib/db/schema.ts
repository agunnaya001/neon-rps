import { pgTable, serial, text, bigint, integer, decimal, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// RPS Game specific tables
export const rpsPlayers = pgTable(
  'rps_players',
  {
    id: serial('id').primaryKey(),
    walletAddress: text('wallet_address').notNull().unique(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    totalGames: integer('total_games').default(0),
    totalWins: integer('total_wins').default(0),
    totalEarnings: bigint('total_earnings', { mode: 'bigint' }).default(0n),
    totalSpent: bigint('total_spent', { mode: 'bigint' }).default(0n),
    referralCode: text('referral_code').unique(),
    referredById: integer('referred_by_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    walletIdx: index('idx_rps_players_wallet').on(table.walletAddress),
    referralIdx: index('idx_rps_players_referral').on(table.referralCode),
  })
)

export const rpsGames = pgTable(
  'rps_games',
  {
    id: serial('id').primaryKey(),
    onChainGameId: bigint('on_chain_game_id', { mode: 'bigint' }).notNull().unique(),
    contractAddress: text('contract_address').notNull(),
    gameType: text('game_type').notNull(), // 'single' or 'best_of_three'
    player1Id: integer('player1_id'),
    player2Id: integer('player2_id'),
    betAmount: bigint('bet_amount', { mode: 'bigint' }).notNull(),
    winnerId: integer('winner_id'),
    feeAmount: bigint('fee_amount', { mode: 'bigint' }).default(0n),
    payoutAmount: bigint('payout_amount', { mode: 'bigint' }),
    status: text('status').default('active'), // 'active', 'completed', 'cancelled', 'disputed'
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    player1Idx: index('idx_rps_games_player1').on(table.player1Id),
    player2Idx: index('idx_rps_games_player2').on(table.player2Id),
    winnerIdx: index('idx_rps_games_winner').on(table.winnerId),
    statusIdx: index('idx_rps_games_status').on(table.status),
  })
)

export const rpsPlayerStats = pgTable(
  'rps_player_stats',
  {
    id: serial('id').primaryKey(),
    playerId: integer('player_id').notNull().unique(),
    winRate: decimal('win_rate', { precision: 5, scale: 2 }).default('0.00'),
    currentStreak: integer('current_streak').default(0),
    bestStreak: integer('best_streak').default(0),
    avgPotSize: bigint('avg_pot_size', { mode: 'bigint' }).default(0n),
    totalVolume: bigint('total_volume', { mode: 'bigint' }).default(0n),
    gamesThisWeek: integer('games_this_week').default(0),
    gamesThisMonth: integer('games_this_month').default(0),
    lastGameAt: timestamp('last_game_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    winRateIdx: index('idx_rps_stats_winrate').on(table.winRate),
  })
)

export const rpsAchievements = pgTable(
  'rps_achievements',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    iconUrl: text('icon_url'),
    rarity: text('rarity'), // 'common', 'uncommon', 'rare', 'epic', 'legendary'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
)

export const rpsPlayerAchievements = pgTable(
  'rps_player_achievements',
  {
    id: serial('id').primaryKey(),
    playerId: integer('player_id').notNull(),
    achievementId: integer('achievement_id').notNull(),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniquePlayerAchievement: unique('unique_player_achievement').on(table.playerId, table.achievementId),
  })
)

export const rpsReferralRewards = pgTable(
  'rps_referral_rewards',
  {
    id: serial('id').primaryKey(),
    referrerId: integer('referrer_id').notNull(),
    refereeId: integer('referee_id').notNull(),
    gameId: integer('game_id').notNull(),
    rewardAmount: bigint('reward_amount', { mode: 'bigint' }).notNull(),
    rewardType: text('reward_type').default('1pct_winnings'),
    status: text('status').default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    uniqueReferralGame: unique('unique_referral_game').on(table.referrerId, table.refereeId, table.gameId),
  })
)

export const rpsTournaments = pgTable(
  'rps_tournaments',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    tournamentType: text('tournament_type').default('single_elimination'),
    status: text('status').default('registration'),
    maxPlayers: integer('max_players').notNull(),
    entryFee: bigint('entry_fee', { mode: 'bigint' }).notNull(),
    prizePool: bigint('prize_pool', { mode: 'bigint' }).notNull(),
    creatorId: integer('creator_id'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    statusIdx: index('idx_rps_tournament_status').on(table.status),
  })
)

export const rpsTournamentParticipants = pgTable(
  'rps_tournament_participants',
  {
    id: serial('id').primaryKey(),
    tournamentId: integer('tournament_id').notNull(),
    playerId: integer('player_id').notNull(),
    seed: integer('seed'),
    status: text('status').default('registered'),
    placement: integer('placement'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueTournamentPlayer: unique('unique_tournament_player').on(table.tournamentId, table.playerId),
  })
)

export const rpsTournamentMatches = pgTable(
  'rps_tournament_matches',
  {
    id: serial('id').primaryKey(),
    tournamentId: integer('tournament_id').notNull(),
    gameId: integer('game_id'),
    player1Id: integer('player1_id').notNull(),
    player2Id: integer('player2_id'),
    winnerId: integer('winner_id'),
    roundNumber: integer('round_number').notNull(),
    matchNumber: integer('match_number').notNull(),
    status: text('status').default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    tournamentMatchIdx: index('idx_rps_tournament_matches').on(table.tournamentId, table.roundNumber),
  })
)
