import { Router } from 'express';
import * as transportController from '../controllers/transport.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireClubRole } from '../middlewares/rbac.middleware';

const router = Router();

/**
 * @openapi
 * /api/events/{eventId}/transport-drivers:
 *   get:
 *     security: [{ BearerAuth: [] }]
 *     summary: List drivers offering rides for an event (any club member)
 *     tags: [Transport]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of drivers with their passengers }
 *       401: { description: Unauthorized }
 *       403: { description: Not a member of the club }
 *       404: { description: Event not found }
 */
router.get(
  '/events/:eventId/transport-drivers',
  authMiddleware,
  transportController.listDrivers,
);

/**
 * @openapi
 * /api/events/{eventId}/transport-drivers:
 *   post:
 *     security: [{ BearerAuth: [] }]
 *     summary: Add a driver offer (president / vice president only)
 *     tags: [Transport]
 */
router.post(
  '/events/:eventId/transport-drivers',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  transportController.createDriver,
);

/**
 * @openapi
 * /api/events/{eventId}/transport-drivers/{driverId}:
 *   patch:
 *     security: [{ BearerAuth: [] }]
 *     summary: Update a driver offer (president / vice president only)
 *     tags: [Transport]
 */
router.patch(
  '/events/:eventId/transport-drivers/:driverId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  transportController.updateDriver,
);

/**
 * @openapi
 * /api/events/{eventId}/transport-drivers/{driverId}:
 *   delete:
 *     security: [{ BearerAuth: [] }]
 *     summary: Remove a driver offer (president / vice president only)
 *     tags: [Transport]
 */
router.delete(
  '/events/:eventId/transport-drivers/:driverId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  transportController.deleteDriver,
);

/**
 * @openapi
 * /api/events/{eventId}/transport-drivers/{driverId}/passengers:
 *   post:
 *     security: [{ BearerAuth: [] }]
 *     summary: Claim a seat on this driver. Pass { user_id } to assign someone
 *              else (officers only). Defaults to caller.
 *     tags: [Transport]
 */
router.post(
  '/events/:eventId/transport-drivers/:driverId/passengers',
  authMiddleware,
  transportController.addPassenger,
);

/**
 * @openapi
 * /api/events/{eventId}/transport-drivers/{driverId}/passengers/{passengerId}:
 *   delete:
 *     security: [{ BearerAuth: [] }]
 *     summary: Drop a seat. Caller can drop themselves; officers can drop anyone.
 *     tags: [Transport]
 */
router.delete(
  '/events/:eventId/transport-drivers/:driverId/passengers/:passengerId',
  authMiddleware,
  transportController.removePassenger,
);

export default router;
