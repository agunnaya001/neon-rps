import {
  pgTable,
  text,
  numeric,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const gamesTable = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: text("game_id").notNull().unique(), // blockchain game ID
  player1Address: text("player1_address").notNull(),
  player2Address: text("player2_address").notNull(),
  player1Move: text("player1_move"), // 'rock', 'paper', 'scissors'
  player2Move: text("player2_move"),
  winner: text("winner"), // null if draw, address if won, 'disputed' if timeout
  betAmount: numeric("bet_amount", { precision: 39, scale: 0 }).notNull(), // in wei
  status: text("status").notNull().default("pending"), // pending, revealed, resolved, refunded, disputed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revealedAt: timestamp("revealed_at"),
  settledAt: timestamp("settled_at"),
  timeoutExpiresAt: timestamp("timeout_expires_at"), // 24h from reveal
  chain: text("chain").notNull().default("sepolia"),
});

export type Game = typeof gamesTable.$inferSelect;
export type InsertGame = typeof gamesTable.$inferInsert;
