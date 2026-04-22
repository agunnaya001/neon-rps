import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const disputesTable = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: text("game_id").notNull(),
  claimantAddress: text("claimant_address").notNull(),
  reason: text("reason").notNull(), // opponent_no_reveal, opponent_no_claim
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"), // refunded, slashed, etc
});

export type Dispute = typeof disputesTable.$inferSelect;
export type InsertDispute = typeof disputesTable.$inferInsert;
