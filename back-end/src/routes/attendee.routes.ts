import { Router } from 'express';
import * as attendeeController from '../controllers/attendee.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireClubRole } from '../middlewares/rbac.middleware';

const router = Router();

/**
 * @openapi
 * /api/events/{eventId}/attendees:
 *   get:
 *     security: [{ BearerAuth: [] }]
 *     summary: List event attendees (any club member)
 *     tags: [Attendees]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Roster of attendees }
 *       401: { description: Unauthorized }
 *       403: { description: Not a member of the club }
 *       404: { description: Event not found }
 */
router.get(
  '/events/:eventId/attendees',
  authMiddleware,
  attendeeController.listAttendees,
);

/**
 * @openapi
 * /api/events/{eventId}/attendees:
 *   post:
 *     security: [{ BearerAuth: [] }]
 *     summary: Add a club member to the roster (president / vice president only)
 *     tags: [Attendees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id: { type: string, format: uuid }
 */
router.post(
  '/events/:eventId/attendees',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  attendeeController.addAttendee,
);

/**
 * @openapi
 * /api/events/{eventId}/attendees/{userId}:
 *   delete:
 *     security: [{ BearerAuth: [] }]
 *     summary: Remove an attendee from the roster (president / vice president only)
 *     tags: [Attendees]
 */
router.delete(
  '/events/:eventId/attendees/:userId',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  attendeeController.removeAttendee,
);

export default router;
