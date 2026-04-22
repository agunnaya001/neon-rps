import { pgTable, text, integer, numeric, timestamp, uuid } from "drizzle-orm/pg-core";

export const playersTable = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  address: text("address").notNull().unique(),
  username: text("username"),
  totalGames: integer("total_games").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  totalProfit: numeric("total_profit", { precision: 39, scale: 0 }).notNull().default("0"), // in wei
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Player = typeof playersTable.$inferSelect;
export type InsertPlayer = typeof playersTable.$inferInsert;
