import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rpsProfile = pgTable("rps_profile", {
  userId: text("user_id").primaryKey(),
  walletAddress: text("wallet_address"),
  totalWins: integer("total_wins").notNull().default(0),
  totalLosses: integer("total_losses").notNull().default(0),
  totalWinnings: text("total_winnings").notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: text("id").primaryKey(),
  period: text("period").notNull(),
  rank: integer("rank").notNull(),
  userId: text("user_id"),
  walletAddress: text("wallet_address"),
  totalWins: integer("total_wins").notNull().default(0),
  totalWinnings: text("total_winnings").notNull().default("0"),
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id"),
  name: text("name").notNull(),
  description: text("description"),
  format: text("format").notNull(),
  maxPlayers: integer("max_players").notNull(),
  entryFee: text("entry_fee").notNull(),
  prizePool: text("prize_pool"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: text("id").primaryKey(),
  day: text("day").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirement: text("requirement").notNull(),
  target: integer("target").notNull(),
  rewardAmount: text("reward_amount").notNull(),
});

export const challengeProgress = pgTable("challenge_progress", {
  id: text("id").primaryKey(),
  challengeId: text("challenge_id").notNull(),
  userId: text("user_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true, createdAt: true });
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type RpsProfile = typeof rpsProfile.$inferSelect;
export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type ChallengeProgress = typeof challengeProgress.$inferSelect;
