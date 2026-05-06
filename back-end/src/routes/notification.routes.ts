import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: List the current user's notifications
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: When true, return only unread notifications.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max rows to return (default 50, max 200).
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination.
 *     responses:
 *       200:
 *         description: Notifications for the current user, newest first.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       notification_id:
 *                         type: string
 *                         format: uuid
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [club_invite, task_assigned, event_reminder, role_changed, event_update]
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                         nullable: true
 *                       metadata:
 *                         type: object
 *                         additionalProperties: true
 *                       read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       club_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       event_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications', authMiddleware, notificationController.listNotifications);

/**
 * @openapi
 * /api/notifications/unread-count:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get the current user's unread notification count
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/notifications/unread-count',
  authMiddleware,
  notificationController.getUnreadCount,
);

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Mark all of the current user's notifications as read
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Number of notifications updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/notifications/read-all',
  authMiddleware,
  notificationController.markAllRead,
);

/**
 * @openapi
 * /api/notifications/event-reminders/run:
 *   post:
 *     security: []
 *     summary: Scan upcoming events and emit event_reminder notifications
 *     description: |
 *       Intended to be called by an external scheduler (cron, GitHub Action,
 *       etc.) every ~hour. Authenticates with a shared secret in the
 *       `x-cron-secret` header (or `Authorization: Bearer <secret>`)
 *       matching `NOTIFICATIONS_CRON_SECRET` in the server environment.
 *
 *       Idempotent: only emits a reminder for an attendee if no
 *       `event_reminder` row already exists for that (user, event) pair.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: lookaheadHours
 *         schema:
 *           type: integer
 *           default: 24
 *       - in: query
 *         name: windowMinutes
 *         schema:
 *           type: integer
 *           default: 60
 *     responses:
 *       200:
 *         description: Scan summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scanned:
 *                   type: integer
 *                 emitted:
 *                   type: integer
 *       401:
 *         description: Missing or invalid cron secret
 *       503:
 *         description: NOTIFICATIONS_CRON_SECRET not configured on server
 */
router.post(
  '/notifications/event-reminders/run',
  notificationController.runEventReminderScan,
);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Mark one notification as read
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch(
  '/notifications/:id/read',
  authMiddleware,
  notificationController.markRead,
);

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: Dismiss a notification
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Notification deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete(
  '/notifications/:id',
  authMiddleware,
  notificationController.deleteNotification,
);

export default router;
