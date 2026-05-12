import { Router } from "express";

import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import clubRoutes from "./club.routes";
import eventRoutes from "./event.routes";
import taskRoutes from "./task.routes";
import notificationRoutes from "./notification.routes";
import userRoutes from "./user.routes";
import safetyRoutes from "./safety.routes";

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(clubRoutes);
router.use(eventRoutes);
router.use(taskRoutes);
router.use(notificationRoutes);
router.use(userRoutes);
router.use(safetyRoutes);

export default router;
