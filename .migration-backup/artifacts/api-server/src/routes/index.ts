import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ogRouter from "./og";
import shareRouter from "./share";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ogRouter);
router.use(shareRouter);

export default router;
