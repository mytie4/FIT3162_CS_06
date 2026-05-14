import { Router } from 'express';
import * as contractController from '../controllers/contract.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireClubRole } from '../middlewares/rbac.middleware';

const router = Router();

// All contract routes are officer-only — contracts track values, counterparties
// and signed dates which we don't want to expose to general members.

/**
 * @openapi
 * /api/events/{eventId}/contracts:
 *   get:
 *     security: [{ BearerAuth: [] }]
 *     summary: List contracts for an event (president / vice president only)
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of contracts }
 *       401: { description: Unauthorized }
 *       403: { description: Not an officer in the club }
 *       404: { description: Event not found }
 */
router.get(
  '/events/:eventId/contracts',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  contractController.listContracts,
);

/**
 * @openapi
 * /api/events/{eventId}/contracts:
 *   post:
 *     security: [{ BearerAuth: [] }]
 *     summary: Create a contract (president / vice president only)
 *     tags: [Contracts]
 */
router.post(
  '/events/:eventId/contracts',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  contractController.createContract,
);

/**
 * @openapi
 * /api/events/{eventId}/contracts/{contractId}:
 *   patch:
 *     security: [{ BearerAuth: [] }]
 *     summary: Update a contract (president / vice president only)
 *     tags: [Contracts]
 */
router.patch(
  '/events/:eventId/contracts/:contractId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  contractController.updateContract,
);

/**
 * @openapi
 * /api/events/{eventId}/contracts/{contractId}:
 *   delete:
 *     security: [{ BearerAuth: [] }]
 *     summary: Delete a contract (president / vice president only)
 *     tags: [Contracts]
 */
router.delete(
  '/events/:eventId/contracts/:contractId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  contractController.deleteContract,
);

export default router;
