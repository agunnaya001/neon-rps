import { db } from "@workspace/db";
import { gamesTable } from "@workspace/db";
import { eq, desc, and, or } from "drizzle-orm";
import { updatePlayerStats } from "./players";

export async function recordGame(data: {
  gameId: string;
  player1Address: string;
  player2Address: string;
  player1Move?: string | null;
  player2Move?: string | null;
  winner?: string | null;
  betAmount: string;
  chain: string;
  status?: string;
}) {
  const [game] = await db
    .insert(gamesTable)
    .values({
      ...data,
      status: data.status || "pending",
      betAmount: data.betAmount,
    })
    .returning();

  return game;
}

export async function markGameRevealed(gameId: string) {
  const [game] = await db
    .update(gamesTable)
    .set({
      revealedAt: new Date(),
      status: "revealed",
    })
    .where(eq(gamesTable.gameId, gameId))
    .returning();

  // Set timeout to 24h from now
  const timeoutExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db
    .update(gamesTable)
    .set({ timeoutExpiresAt })
    .where(eq(gamesTable.gameId, gameId));

  return game;
}

export async function settleGame(
  gameId: string,
  winner: string | null,
  winnerProfit?: string,
  loserProfit?: string,
) {
  const [game] = await db
    .update(gamesTable)
    .set({
      winner,
      settledAt: new Date(),
      status: "resolved",
    })
    .where(eq(gamesTable.gameId, gameId))
    .returning();

  // Update player stats
  if (game) {
    if (winner && winner !== "draw") {
      // Winner gets 1 win
      await updatePlayerStats(winner, {
        wins: 1,
        profitChange: winnerProfit || "0",
      });
      // Loser gets 1 loss
      const loser =
        game.player1Address === winner ? game.player2Address : game.player1Address;
      await updatePlayerStats(loser, {
        losses: 1,
        profitChange: loserProfit || "0",
      });
    } else if (winner === "draw") {
      // Draw - both get a game but no win/loss
      await updatePlayerStats(game.player1Address, {
        profitChange: "0",
      });
      await updatePlayerStats(game.player2Address, {
        profitChange: "0",
      });
    }
  }

  return game;
}

export async function getGame(gameId: string) {
  return db.query.gamesTable.findFirst({
    where: eq(gamesTable.gameId, gameId),
  });
}

export async function getPlayerGameHistory(
  address: string,
  limit: number = 20,
  offset: number = 0,
) {
  const games = await db.query.gamesTable.findMany({
    where: (gamesTable) =>
      or(
        eq(gamesTable.player1Address, address),
        eq(gamesTable.player2Address, address),
      ),
    orderBy: desc(gamesTable.createdAt),
    limit,
    offset,
  });

  return games;
}

export async function getGamesByStatus(
  status: string,
  limit: number = 50,
  offset: number = 0,
) {
  return db.query.gamesTable.findMany({
    where: eq(gamesTable.status, status),
    orderBy: desc(gamesTable.createdAt),
    limit,
    offset,
  });
}

export async function checkGameTimeout(gameId: string) {
  const game = await getGame(gameId);

  if (!game) return null;

  const now = new Date();
  if (
    game.status === "revealed" &&
    game.timeoutExpiresAt &&
    now > game.timeoutExpiresAt
  ) {
    return true;
  }

  return false;
}


