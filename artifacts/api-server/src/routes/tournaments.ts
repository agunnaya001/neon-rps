import { Router } from "express";
import { db } from "@workspace/db";
import { tournaments } from "@workspace/db";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { CreateTournamentBody } from "@workspace/api-zod";

const router = Router();

router.get("/tournaments", async (req, res) => {
  try {
    const allTournaments = await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.createdAt))
      .limit(50);

    return res.json(allTournaments);
  } catch (error) {
    req.log.error({ error }, "GET /tournaments error");
    return res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

router.post("/tournaments", async (req, res) => {
  try {
    const parsed = CreateTournamentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { name, description, format, maxPlayers, entryFee } = parsed.data;
    const tournamentId = nanoid();

    const newTournament = await db
      .insert(tournaments)
      .values({
        id: tournamentId,
        name,
        description: description ?? null,
        format,
        maxPlayers,
        entryFee,
        status: "open",
      })
      .returning();

    return res.status(201).json(newTournament[0]);
  } catch (error) {
    req.log.error({ error }, "POST /tournaments error");
    return res.status(500).json({ error: "Failed to create tournament" });
  }
});

export default router;
