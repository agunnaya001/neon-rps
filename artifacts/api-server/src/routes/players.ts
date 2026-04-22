import { Router, type IRouter, type Request, type Response } from "express";
import { getPlayerStats, getOrCreatePlayer } from "../db/queries/players";
import { getPlayerGameHistory } from "../db/queries/games";

const router: IRouter = Router();

// Get player profile
router.get("/players/:address", async (req: Request, res: Response): Promise<void> => {
  try {
    const address = req.params.address as string;

    if (!address) {
      res.status(400).json({ error: "address required" });
      return;
    }

    const player = await getPlayerStats(address);

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    // Get recent games
    const recentGames = await getPlayerGameHistory(address, 10, 0);

    res.json({
      ...player,
      recentGames,
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

// Update player profile (username)
router.put("/players/:address", async (req: Request, res: Response): Promise<void> => {
  try {
    const address = req.params.address as string;
    const { username } = req.body;

    if (!address) {
      res.status(400).json({ error: "address required" });
      return;
    }

    // TODO: Verify user is authenticated and owns the address
    // For now, we'll just update the username

    // Note: Need to add an update query to db/queries/players.ts
    // For now, return a mock response
    const player = await getOrCreatePlayer(address);

    res.json({
      ...player,
      username,
    });
  } catch (error) {
    console.error("Error updating player:", error);
    res.status(500).json({ error: "Failed to update player" });
  }
});

// Get player stats
router.get("/players/:address/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const address = req.params.address as string;

    if (!address) {
      res.status(400).json({ error: "address required" });
      return;
    }

    const player = await getPlayerStats(address);

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const recentGames = await getPlayerGameHistory(address, 50, 0);

    // Calculate advanced stats
    const wins = recentGames.filter((g) => g.winner === address).length;
    const losses = recentGames.filter((g) => g.winner && g.winner !== address).length;
    const draws = recentGames.filter((g) => g.winner === null || g.winner === "draw").length;

    const totalBet = recentGames.reduce(
      (sum, g) => sum + BigInt(g.betAmount),
      BigInt(0),
    );

    res.json({
      player,
      recentStats: {
        wins,
        losses,
        draws,
        winRate: recentGames.length > 0 ? (wins / recentGames.length * 100).toFixed(2) : "0",
        averageBet: recentGames.length > 0 ? (totalBet / BigInt(recentGames.length)).toString() : "0",
      },
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    res.status(500).json({ error: "Failed to fetch player stats" });
  }
});

export default router;
