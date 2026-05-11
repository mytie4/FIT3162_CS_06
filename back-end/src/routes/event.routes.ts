import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireClubRole } from '../middlewares/rbac.middleware';

const router = Router();

/**
 * @openapi
 * /api/events:
 *   post:
 *    security:
 *     - BearerAuth: []
 *    summary: Create a new event (president or vice president only)
 *    tags:
 *     - Events
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/CreateEventRequest'
 *    responses:
 *     201:
 *      description: Event created successfully
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           example: Event created successfully
 *          event:
 *           $ref: '#/components/schemas/EventResponse'
 *     400:
 *      description: Bad request (e.g., validation errors)
 *     401:
 *      description: Unauthorized (e.g., missing or invalid token)
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     500:
 *      description: Internal server error
 *
 */
router.post(
  '/events',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  eventController.createEvent,
);

/**
 * @openapi
 * /api/events:
 *   get:
 *    summary: Get all events
 *    tags:
 *     - Events
 *    responses:
 *     200:
 *      description: A list of events
 *      content:
 *       application/json:
 *        schema:
 *         type: array
 *         items:
 *          $ref: '#/components/schemas/EventWithClubName'
 *     500:
 *      description: Internal server error
 */
router.get('/events', authMiddleware, eventController.getAllEvents);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *    security: []
 *    summary: Get event by ID
 *    tags:
 *     - Events
 *    parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    responses:
 *     200:
 *      description: Event found
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/EventWithClubName'
 *     404:
 *      description: Event not found
 *     500:
 *      description: Internal server error
 */
router.get('/events/:id', eventController.getEventById);

/**
 * @openapi
 * /api/clubs/{clubId}/events:
 *   get:
 *    security: []
 *    summary: Get all events for a club
 *    tags:
 *     - Events
 *    parameters:
 *     - in: path
 *       name: clubId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    responses:
 *     200:
 *      description: A list of events for the specified club
 *      content:
 *       application/json:
 *        schema:
 *         type: array
 *         items:
 *          $ref: '#/components/schemas/EventResponse'
 *     400:
 *      description: Bad request (e.g., missing club ID)
 *     404:
 *      description: Club not found
 *     500:
 *      description: Internal server error
 */
router.get('/clubs/:clubId/events', eventController.getEventsByClubId);

/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *    security:
 *      - BearerAuth: []
 *    summary: Update an event (president or vice president only)
 *    tags:
 *     - Events
 *    parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/UpdateEventRequest'
 *    responses:
 *     200:
 *      description: Event updated successfully
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           example: Event updated successfully
 *          event:
 *           $ref: '#/components/schemas/EventResponse'
 *     400:
 *      description: Bad request (e.g., validation errors)
 *     401:
 *      description: Unauthorized (e.g., missing or invalid token)
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     404:
 *      description: Event not found
 *     500:
 *      description: Internal server error
 */
router.put(
  '/events/:id',
  authMiddleware,
  requireClubRole('president', 'vice_president'),
  eventController.updateEvent,
);

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *    security:
 *     - BearerAuth: []
 *    summary: Delete an event (president only)
 *    tags:
 *     - Events
 *    parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    responses:
 *     204:
 *      description: Event deleted successfully
 *     400:
 *      description: Bad request (e.g., missing event ID)
 *     401:
 *      description: Unauthorized (e.g., missing or invalid token)
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     404:
 *      description: Event not found
 *     500:
 *      description: Internal server error
 */
router.delete(
  '/events/:id',
  authMiddleware,
  requireClubRole('president'),
  eventController.deleteEvent,
);

export default router;
