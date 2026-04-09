import { Router } from "express";

import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import clubRoutes from "./club.routes";

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(clubRoutes);

export default router;
