import { Router, type IRouter, type Request, type Response } from "express";
import { getLeaderboard, getTopPlayersThisWeek } from "../db/queries/players";

const router: IRouter = Router();

// Get global leaderboard
router.get("/leaderboard", async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || "50"), 100);
    const offset = parseInt((req.query.offset as string) || "0");

    const players = await getLeaderboard(limit, offset);

    // Add rank to each player
    const ranked = players.map((player, index) => ({
      ...player,
      rank: offset + index + 1,
    }));

    res.json({
      players: ranked,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get top players this week
router.get("/leaderboard/top-week", async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || "10"), 50);

    const players = await getTopPlayersThisWeek(limit);

    const ranked = players.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    res.json({
      players: ranked,
      period: "week",
    });
  } catch (error) {
    console.error("Error fetching weekly leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch weekly leaderboard" });
  }
});

export default router;
