import { Router, type IRouter, type Request, type Response } from "express";
import {
  recordGame,
  markGameRevealed,
  settleGame,
  getGame,
  getPlayerGameHistory,
} from "../db/queries/games";

const router: IRouter = Router();

// Record a new game result
router.post("/games", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      gameId,
      player1Address,
      player2Address,
      player1Move,
      player2Move,
      winner,
      betAmount,
      chain,
    } = req.body;

    if (!gameId || !player1Address || !player2Address || !betAmount) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const game = await recordGame({
      gameId,
      player1Address,
      player2Address,
      player1Move,
      player2Move,
      winner,
      betAmount,
      chain: chain || "sepolia",
      status: "pending",
    });

    res.json(game);
  } catch (error) {
    console.error("Error recording game:", error);
    res.status(500).json({ error: "Failed to record game" });
  }
});

// Mark game as revealed
router.post("/games/:gameId/reveal", async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.gameId as string;
    const { player1Move, player2Move } = req.body;

    const game = await markGameRevealed(gameId);

    if (player1Move || player2Move) {
      // Update moves if provided
      // TODO: Add move update query
    }

    res.json(game);
  } catch (error) {
    console.error("Error marking game revealed:", error);
    res.status(500).json({ error: "Failed to mark game revealed" });
  }
});

// Settle a game after blockchain confirmation
router.post("/games/:gameId/settle", async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.gameId as string;
    const { winner, winnerProfit, loserProfit } = req.body;

    if (!gameId) {
      res.status(400).json({ error: "gameId required" });
      return;
    }

    const game = await settleGame(gameId, winner, winnerProfit, loserProfit);

    res.json(game);
  } catch (error) {
    console.error("Error settling game:", error);
    res.status(500).json({ error: "Failed to settle game" });
  }
});

// Get single game
router.get("/games/:gameId", async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.gameId as string;

    const game = await getGame(gameId);

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// Get user's game history
router.get("/games", async (req: Request, res: Response): Promise<void> => {
  try {
    const address = req.query.address as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || "20"), 100);
    const offset = parseInt((req.query.offset as string) || "0");

    if (!address) {
      res.status(400).json({ error: "address required" });
      return;
    }

    const games = await getPlayerGameHistory(address, limit, offset);

    res.json({
      games,
      limit,
      offset,
      total: games.length,
    });
  } catch (error) {
    console.error("Error fetching game history:", error);
    res.status(500).json({ error: "Failed to fetch game history" });
  }
});

export default router;
