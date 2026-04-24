import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireClubRole } from '../middlewares/rbac.middleware';

const router = Router();

/**
 * @openapi
 * /api/events/{eventId}/tasks:
 *   post:
 *    security:
 *     - BearerAuth: []
 *    summary: Create a new task for an event (president or vice president only)
 *    tags:
 *     - Tasks
 *    parameters:
 *     - in: path
 *       name: eventId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/CreateTaskRequest'
 *    responses:
 *     201:
 *      description: Task created successfully
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           example: Task created successfully
 *          task:
 *           $ref: '#/components/schemas/TaskResponse'
 *     400:
 *      description: Bad request (e.g., validation errors)
 *     401:
 *      description: Unauthorized (e.g., missing or invalid token)
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     404:
 *      description: Event or parent task not found
 *     500:
 *      description: Internal server error
 */
router.post(
    '/events/:eventId/tasks',
    authMiddleware,
    requireClubRole('president', 'vice_president'),
    taskController.createTask,
);

/**
 * @openapi
 * /api/events/{eventId}/tasks:
 *   get:
 *    security:
 *     - BearerAuth: []
 *    summary: List all tasks for an event (club members only)
 *    tags:
 *     - Tasks
 *    parameters:
 *     - in: path
 *       name: eventId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    responses:
 *     200:
 *      description: A list of tasks for the specified event
 *      content:
 *       application/json:
 *        schema:
 *         type: array
 *         items:
 *          $ref: '#/components/schemas/TaskWithAssignees'
 *     401:
 *      description: Unauthorized
 *     403:
 *      description: Forbidden (not a member of the club)
 *     404:
 *      description: Event not found
 *     500:
 *      description: Internal server error
 */
router.get(
    '/events/:eventId/tasks',
    authMiddleware,
    taskController.getTasksByEventId,
);

/**
 * @openapi
 * /api/tasks/{taskId}:
 *   get:
 *    security:
 *     - BearerAuth: []
 *    summary: Get a single task by ID (club members only)
 *    tags:
 *     - Tasks
 *    parameters:
 *     - in: path
 *       name: taskId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    responses:
 *     200:
 *      description: Task found
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/TaskWithAssignees'
 *     401:
 *      description: Unauthorized
 *     403:
 *      description: Forbidden (not a member of the club)
 *     404:
 *      description: Task not found
 *     500:
 *      description: Internal server error
 */
router.get(
    '/tasks/:taskId',
    authMiddleware,
    taskController.getTaskById,
);

/**
 * @openapi
 * /api/tasks/{taskId}:
 *   put:
 *    security:
 *     - BearerAuth: []
 *    summary: Update a task (president/VP for any field; members can only update status of their own tasks)
 *    tags:
 *     - Tasks
 *    parameters:
 *     - in: path
 *       name: taskId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/UpdateTaskRequest'
 *    responses:
 *     200:
 *      description: Task updated successfully
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           example: Task updated successfully
 *          task:
 *           $ref: '#/components/schemas/TaskResponse'
 *     400:
 *      description: Bad request (e.g., validation errors)
 *     401:
 *      description: Unauthorized
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     404:
 *      description: Task not found
 *     500:
 *      description: Internal server error
 */
router.put(
    '/tasks/:taskId',
    authMiddleware,
    taskController.updateTask,
);

/**
 * @openapi
 * /api/tasks/{taskId}:
 *   delete:
 *    security:
 *     - BearerAuth: []
 *    summary: Delete a task (president or vice president only)
 *    tags:
 *     - Tasks
 *    parameters:
 *     - in: path
 *       name: taskId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    responses:
 *     204:
 *      description: Task deleted successfully
 *     401:
 *      description: Unauthorized
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     404:
 *      description: Task not found
 *     500:
 *      description: Internal server error
 */
router.delete(
    '/tasks/:taskId',
    authMiddleware,
    requireClubRole('president', 'vice_president'),
    taskController.deleteTask,
);

/**
 * @openapi
 * /api/tasks/{taskId}/assignees:
 *   post:
 *    security:
 *     - BearerAuth: []
 *    summary: Assign a user to a task (president or vice president only)
 *    tags:
 *     - Tasks
 *    parameters:
 *     - in: path
 *       name: taskId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/AssignUserRequest'
 *    responses:
 *     201:
 *      description: User assigned to task successfully
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           example: User assigned to task successfully
 *     400:
 *      description: Bad request (e.g., user not in club)
 *     401:
 *      description: Unauthorized
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     404:
 *      description: Task not found
 *     409:
 *      description: User is already assigned to this task
 *     500:
 *      description: Internal server error
 */
router.post(
    '/tasks/:taskId/assignees',
    authMiddleware,
    requireClubRole('president', 'vice_president'),
    taskController.assignUser,
);

/**
 * @openapi
 * /api/tasks/{taskId}/assignees/{userId}:
 *   delete:
 *    security:
 *     - BearerAuth: []
 *    summary: Unassign a user from a task (president or vice president only)
 *    tags:
 *     - Tasks
 *    parameters:
 *     - in: path
 *       name: taskId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *     - in: path
 *       name: userId
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *    responses:
 *     204:
 *      description: User unassigned from task successfully
 *     401:
 *      description: Unauthorized
 *     403:
 *      description: Forbidden (e.g., insufficient permissions)
 *     404:
 *      description: Task not found or user is not assigned
 *     500:
 *      description: Internal server error
 */
router.delete(
    '/tasks/:taskId/assignees/:userId',
    authMiddleware,
    requireClubRole('president', 'vice_president'),
    taskController.unassignUser,
);

export default router;
