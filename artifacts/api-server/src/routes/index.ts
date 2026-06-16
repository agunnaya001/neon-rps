import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leaderboardRouter from "./leaderboard";
import tournamentsRouter from "./tournaments";
import challengesRouter from "./challenges";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leaderboardRouter);
router.use(tournamentsRouter);
router.use(challengesRouter);

export default router;
