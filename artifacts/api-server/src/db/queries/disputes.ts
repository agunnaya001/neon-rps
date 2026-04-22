import { db } from "@workspace/db";
import { disputesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { checkGameTimeout, getGame } from "./games";

export async function fileDispute(data: {
  gameId: string;
  claimantAddress: string;
  reason: string;
}) {
  // Verify game exists and timeout window applies
  const game = await getGame(data.gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  const hasTimeout = await checkGameTimeout(data.gameId);
  if (!hasTimeout) {
    throw new Error("Dispute window not yet open or already closed");
  }

  // Check if dispute already exists
  const existing = await db.query.disputesTable.findFirst({
    where: eq(disputesTable.gameId, data.gameId),
  });

  if (existing) {
    return existing;
  }

  const [dispute] = await db
    .insert(disputesTable)
    .values(data)
    .returning();

  return dispute;
}

export async function getDispute(gameId: string) {
  return db.query.disputesTable.findFirst({
    where: eq(disputesTable.gameId, gameId),
  });
}

export async function resolveDispute(
  gameId: string,
  resolution: string,
  resolvedAt?: Date,
) {
  const [dispute] = await db
    .update(disputesTable)
    .set({
      resolution,
      resolvedAt: resolvedAt || new Date(),
    })
    .where(eq(disputesTable.gameId, gameId))
    .returning();

  return dispute;
}

export async function getUnresolvedDisputes(limit: number = 50, offset: number = 0) {
  return db.query.disputesTable.findMany({
    orderBy: desc(disputesTable.createdAt),
    limit,
    offset,
  });
  // TODO: Filter by unresolved status only when drizzle query builder supports IS NULL
}
