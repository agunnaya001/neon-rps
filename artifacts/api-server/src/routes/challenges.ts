import { Router } from "express";
import { db } from "@workspace/db";
import { dailyChallenges, challengeProgress } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/challenges", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const challenge = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.day, today))
      .limit(1);

    if (!challenge.length) {
      return res.json({ challenge: null, progress: null });
    }

    return res.json({ challenge: challenge[0], progress: null });
  } catch (error) {
    req.log.error({ error }, "GET /challenges error");
    return res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

router.post("/challenges", async (req, res) => {
  try {
    const { challengeId, progress } = req.body;
    if (!challengeId) {
      return res.status(400).json({ error: "Challenge ID required" });
    }

    const existing = await db
      .select()
      .from(challengeProgress)
      .where(eq(challengeProgress.challengeId, challengeId))
      .limit(1);

    let updated;
    if (existing.length) {
      updated = await db
        .update(challengeProgress)
        .set({ progress: (existing[0].progress || 0) + (progress || 1) })
        .where(eq(challengeProgress.id, existing[0].id))
        .returning();
    } else {
      updated = await db
        .insert(challengeProgress)
        .values({
          id: `cp_${Date.now()}`,
          challengeId,
          userId: "anonymous",
          progress: progress || 1,
        })
        .returning();
    }

    return res.json(updated[0]);
  } catch (error) {
    req.log.error({ error }, "POST /challenges error");
    return res.status(500).json({ error: "Failed to update challenge" });
  }
});

export default router;
