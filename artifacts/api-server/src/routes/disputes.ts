import { Router, type IRouter, type Request, type Response } from "express";
import {
  fileDispute,
  getDispute,
  resolveDispute,
  getUnresolvedDisputes,
} from "../db/queries/disputes";

const router: IRouter = Router();

// File a dispute
router.post("/disputes", async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId, claimantAddress, reason } = req.body;

    if (!gameId || !claimantAddress || !reason) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const dispute = await fileDispute({
      gameId,
      claimantAddress,
      reason,
    });

    res.json(dispute);
  } catch (error: any) {
    console.error("Error filing dispute:", error);
    res.status(400).json({ error: error.message || "Failed to file dispute" });
  }
});

// Get dispute status
router.get("/disputes/:gameId", async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.gameId as string;

    const dispute = await getDispute(gameId);

    if (!dispute) {
      res.status(404).json({ error: "Dispute not found" });
      return;
    }

    res.json(dispute);
  } catch (error) {
    console.error("Error fetching dispute:", error);
    res.status(500).json({ error: "Failed to fetch dispute" });
  }
});

// Resolve a dispute
router.post("/disputes/:gameId/resolve", async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.gameId as string;
    const { resolution } = req.body;

    if (!resolution) {
      res.status(400).json({ error: "resolution required" });
      return;
    }

    // TODO: Verify admin/backend can only call this
    const dispute = await resolveDispute(gameId, resolution);

    res.json(dispute);
  } catch (error) {
    console.error("Error resolving dispute:", error);
    res.status(500).json({ error: "Failed to resolve dispute" });
  }
});

// Get unresolved disputes (admin only)
router.get("/disputes", async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || "50"), 100);
    const offset = parseInt((req.query.offset as string) || "0");

    // TODO: Verify admin access

    const disputes = await getUnresolvedDisputes(limit, offset);

    res.json({
      disputes,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({ error: "Failed to fetch disputes" });
  }
});

export default router;
