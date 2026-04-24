import { Router } from "express";

import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import clubRoutes from "./club.routes";
import eventRoutes from "./event.routes";
import taskRoutes from "./task.routes";

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(clubRoutes);
router.use(eventRoutes);
router.use(taskRoutes);

export default router;
