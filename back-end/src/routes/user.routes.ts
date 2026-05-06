import { Router } from 'express';

import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/users/search:
 *   get:
 *     summary: Substring-search the platform's user directory
 *     description: |
 *       Returns up to `limit` users whose name or email matches `q`
 *       (case-insensitive substring). The current user is always excluded.
 *       Pass `clubId` to also exclude users who are already members of
 *       that club — useful for "invite to club" pickers.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Substring to match against name and email.
 *       - in: query
 *         name: clubId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional club whose existing members are excluded.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 25
 *           default: 10
 *     responses:
 *       200:
 *         description: Matching users (newest first by name).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserSearchResult'
 *       400:
 *         description: Query too short or otherwise invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users/search', authMiddleware, userController.searchUsers);

export default router;
