import { Router } from 'express';
import * as safetyController from '../controllers/safety.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireClubRole } from '../middlewares/rbac.middleware';

const router = Router();

// ---- Safety Checks ---------------------------------------------------------

/**
 * @openapi
 * /api/events/{eventId}/safety-checks:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: List safety checklist items for an event
 *     tags: [Safety]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of safety checks }
 *       401: { description: Unauthorized }
 *       403: { description: Not a member of the club }
 *       404: { description: Event not found }
 */
router.get(
  '/events/:eventId/safety-checks',
  authMiddleware,
  safetyController.getSafetyChecks,
);

/**
 * @openapi
 * /api/events/{eventId}/safety-checks:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add a safety checklist item (president / vice president only)
 *     tags: [Safety]
 */
router.post(
  '/events/:eventId/safety-checks',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.createSafetyCheck,
);

/**
 * @openapi
 * /api/events/{eventId}/safety-checks/{checkId}:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Update or tick off a safety check (president / vice president only)
 *     tags: [Safety]
 */
router.patch(
  '/events/:eventId/safety-checks/:checkId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.updateSafetyCheck,
);

/**
 * @openapi
 * /api/events/{eventId}/safety-checks/{checkId}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: Remove a safety check item (president / vice president only)
 *     tags: [Safety]
 */
router.delete(
  '/events/:eventId/safety-checks/:checkId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.deleteSafetyCheck,
);

// ---- Hazards ---------------------------------------------------------------

/**
 * @openapi
 * /api/events/{eventId}/hazards:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: List hazards for an event
 *     tags: [Safety]
 */
router.get(
  '/events/:eventId/hazards',
  authMiddleware,
  safetyController.getHazards,
);

/**
 * @openapi
 * /api/events/{eventId}/hazards:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add a hazard chip (president / vice president only)
 *     tags: [Safety]
 */
router.post(
  '/events/:eventId/hazards',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.createHazard,
);

/**
 * @openapi
 * /api/events/{eventId}/hazards/{hazardId}:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Update a hazard (president / vice president only)
 *     tags: [Safety]
 */
router.patch(
  '/events/:eventId/hazards/:hazardId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.updateHazard,
);

/**
 * @openapi
 * /api/events/{eventId}/hazards/{hazardId}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: Remove a hazard (president / vice president only)
 *     tags: [Safety]
 */
router.delete(
  '/events/:eventId/hazards/:hazardId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.deleteHazard,
);

// ---- Emergency Contacts ----------------------------------------------------

/**
 * @openapi
 * /api/events/{eventId}/emergency-contacts:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: List emergency contacts for an event
 *     tags: [Safety]
 */
router.get(
  '/events/:eventId/emergency-contacts',
  authMiddleware,
  safetyController.getEmergencyContacts,
);

/**
 * @openapi
 * /api/events/{eventId}/emergency-contacts:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add an emergency contact (president / vice president only)
 *     tags: [Safety]
 */
router.post(
  '/events/:eventId/emergency-contacts',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.createEmergencyContact,
);

/**
 * @openapi
 * /api/events/{eventId}/emergency-contacts/{contactId}:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Update an emergency contact (president / vice president only)
 *     tags: [Safety]
 */
router.patch(
  '/events/:eventId/emergency-contacts/:contactId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.updateEmergencyContact,
);

/**
 * @openapi
 * /api/events/{eventId}/emergency-contacts/{contactId}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: Remove an emergency contact (president / vice president only)
 *     tags: [Safety]
 */
router.delete(
  '/events/:eventId/emergency-contacts/:contactId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  safetyController.deleteEmergencyContact,
);

export default router;
