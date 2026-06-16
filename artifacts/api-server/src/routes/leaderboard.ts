import { Router } from "express";
import { db } from "@workspace/db";
import { rpsProfile, leaderboardSnapshots } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const period = (req.query.period as string) || "all-time";

    const leaderboard = await db
      .select({
        rank: leaderboardSnapshots.rank,
        walletAddress: leaderboardSnapshots.walletAddress,
        totalWins: leaderboardSnapshots.totalWins,
        totalWinnings: leaderboardSnapshots.totalWinnings,
      })
      .from(leaderboardSnapshots)
      .where(eq(leaderboardSnapshots.period, period))
      .orderBy(leaderboardSnapshots.rank)
      .limit(100);

    if (!leaderboard.length) {
      const profiles = await db
        .select()
        .from(rpsProfile)
        .orderBy(desc(rpsProfile.totalWins))
        .limit(100);

      return res.json({
        period,
        data: profiles.map((p, idx) => ({
          rank: idx + 1,
          walletAddress: p.walletAddress,
          totalWins: p.totalWins,
          totalWinnings: p.totalWinnings,
        })),
      });
    }

    return res.json({ period, data: leaderboard });
  } catch (error) {
    req.log.error({ error }, "GET /leaderboard error");
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
