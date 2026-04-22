import { db } from "@workspace/db";
import { playersTable } from "@workspace/db";
import { eq, desc, and, gt } from "drizzle-orm";

export async function getOrCreatePlayer(address: string) {
  const existing = await db.query.playersTable.findFirst({
    where: eq(playersTable.address, address),
  });

  if (existing) {
    return existing;
  }

  const [player] = await db
    .insert(playersTable)
    .values({
      address,
      totalGames: 0,
      wins: 0,
      losses: 0,
      totalProfit: "0",
    })
    .returning();

  return player;
}

export async function getPlayerStats(address: string) {
  const player = await db.query.playersTable.findFirst({
    where: eq(playersTable.address, address),
  });

  if (!player) return null;

  return {
    ...player,
    winRate: player.totalGames > 0 ? (player.wins / player.totalGames * 100).toFixed(2) : "0",
  };
}

export async function updatePlayerStats(
  address: string,
  update: {
    wins?: number;
    losses?: number;
    profitChange?: string;
  },
) {
  const player = await getOrCreatePlayer(address);

  const newWins = update.wins !== undefined ? player.wins + update.wins : player.wins;
  const newLosses = update.losses !== undefined ? player.losses + update.losses : player.losses;
  const newTotalGames = newWins + newLosses;
  const newProfit =
    update.profitChange !== undefined
      ? (BigInt(player.totalProfit || "0") + BigInt(update.profitChange)).toString()
      : player.totalProfit;

  const [updated] = await db
    .update(playersTable)
    .set({
      wins: newWins,
      losses: newLosses,
      totalGames: newTotalGames,
      totalProfit: newProfit,
      updatedAt: new Date(),
    })
    .where(eq(playersTable.address, address))
    .returning();

  return updated;
}

export async function getLeaderboard(limit: number = 50, offset: number = 0) {
  const players = await db.query.playersTable.findMany({
    where: gt(playersTable.totalGames, 0),
    orderBy: [desc(playersTable.wins), desc(playersTable.totalProfit)],
    limit,
    offset,
  });

  return players.map((player) => ({
    ...player,
    winRate: player.totalGames > 0 ? (player.wins / player.totalGames * 100).toFixed(2) : "0",
  }));
}

export async function getTopPlayersThisWeek(limit: number = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get games from last week and aggregate
  const players = await db.query.playersTable.findMany({
    where: gt(playersTable.totalGames, 0),
    orderBy: [desc(playersTable.wins), desc(playersTable.totalProfit)],
    limit,
  });

  // TODO: Filter by games created in last 7 days when implementing games.ts
  return players.map((player) => ({
    ...player,
    winRate: player.totalGames > 0 ? (player.wins / player.totalGames * 100).toFixed(2) : "0",
  }));
}
