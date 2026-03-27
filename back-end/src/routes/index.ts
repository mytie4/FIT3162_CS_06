import { Router } from 'express';

import authRoutes from './auth.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);

export default router;
