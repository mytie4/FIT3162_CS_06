import { Router } from 'express';

import * as healthController from '../controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     security: []
 *     summary: API health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', healthController.healthCheck);

/**
 * @openapi
 * /api/health/db:
 *   get:
 *     security: []
 *     summary: Database health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Database is connected
 *       500:
 *         description: Database is disconnected
 */
router.get('/health/db', healthController.dbHealthCheck);

export default router;
