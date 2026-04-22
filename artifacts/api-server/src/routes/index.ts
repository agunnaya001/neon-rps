import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ogRouter from "./og";
import shareRouter from "./share";
import gamesRouter from "./games";
import leaderboardRouter from "./leaderboard";
import playersRouter from "./players";
import disputesRouter from "./disputes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ogRouter);
router.use(shareRouter);
router.use(gamesRouter);
router.use(leaderboardRouter);
router.use(playersRouter);
router.use(disputesRouter);

export default router;
