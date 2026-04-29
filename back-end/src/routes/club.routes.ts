import { Router } from "express";
import * as clubController from "../controllers/club.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireClubRole } from "../middlewares/rbac.middleware";

const router = Router();

/**
 * @openapi
 * /api/clubs:
 *   post:
 *     security:
 *      - BearerAuth: []
 *     summary: Create a new club and assign the creator as admin
 *     tags:
 *       - Clubs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClubRequest'
 *     responses:
 *       201:
 *         description: Club created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Club created successfully
 *                 club:
 *                   $ref: '#/components/schemas/ClubResponse'
 *       400:
 *         description: Invalid request data
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/clubs", authMiddleware, clubController.createClub);

/**
 * @openapi
 * /api/clubs:
 *   get:
 *     summary: Fetch all clubs
 *     tags:
 *       - Clubs
 *     responses:
 *       200:
 *         description: A list of all clubs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClubWithStats'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/clubs", authMiddleware, clubController.getAllClubs);

/**
 * @openapi
 * /api/clubs/join:
 *   post:
 *     security:
 *      - BearerAuth: []
 *     summary: Join a club using a join code
 *     tags:
 *       - Clubs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               joinCode:
 *                 type: number
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Successfully joined the club
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully joined club
 *       400:
 *         description: Invalid join code or user already in club
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/clubs/join", authMiddleware, clubController.joinClub);

/**
 * @openapi
 * /api/clubs/leave:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Leave a club the user is currently a member of
 *     tags:
 *       - Clubs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clubID:
 *                 type: string
 *                 example:
 *     responses:
 *       200:
 *         description: Successfully left the club
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully left the club
 *       400:
 *         description: User is not a member of this club or invalid input
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/clubs/leave", authMiddleware, clubController.leaveClub);

/**
 * @openapi
 * /api/clubs/{clubId}:
 *   get:
 *     summary: Get a single club by ID (with member count and event stats)
 *     tags:
 *       - Clubs
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Club details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClubWithStats'
 *       404:
 *         description: Club not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/clubs/:clubId", clubController.getClubById);

/**
 * @openapi
 * /api/clubs/{clubId}:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Update club details (president & vice-president only)
 *     tags:
 *       - Clubs
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               shared_drive_link:
 *                 type: string
 *               discord_link:
 *                 type: string
 *               instagram_link:
 *                 type: string
 *               website_link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Club updated successfully
 *       401:
 *        description: Unauthorized - missing or invalid JWT
 *       403:
 *         description: Forbidden — only the president & vice-president can update
 *       404:
 *         description: Club not found
 */
router.patch(
  "/clubs/:clubId",
  authMiddleware,
  requireClubRole("president", "vice_president"),
  clubController.updateClub,
);

/**
 * @openapi
 * /api/clubs/{clubId}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: Delete a club and all associated data (president only)
 *     tags:
 *       - Clubs
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Club deleted successfully
 *       401:
 *        description: Unauthorized - missing or invalid JWT
 *       403:
 *         description: Forbidden — only the president can delete
 *       404:
 *         description: Club not found
 */
router.delete(
  "/clubs/:clubId",
  authMiddleware,
  requireClubRole("president"),
  clubController.deleteClub,
);

/**
 * @openapi
 * /api/clubs/{clubId}/members:
 *   get:
 *     summary: Get all members of a club with their roles
 *     tags:
 *       - Clubs
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: A list of club members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   role:
 *                     type: string
 *                   joined_at:
 *                     type: string
 *       404:
 *         description: Club not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/clubs/:clubId/members", clubController.getClubMembers);

/**
 * @openapi
 * /api/clubs/{clubId}/my-role:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get the current user's role in a specific club
 *     tags:
 *       - Clubs
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User's role in the club (null if not a member)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                   enum: [president, vice_president, member]
 *                   nullable: true
 *                   example: president
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/clubs/:clubId/my-role",
  authMiddleware,
  clubController.getUserRole,
);

/**
 * @openapi
 * /api/clubs/{clubId}/members/{userId}/role:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Change a member's role in a club (president only)
 *     tags:
 *       - Clubs
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [president, vice_president, member]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       401:
 *         description: Unauthorized - missing or invalid JWT
 *       403:
 *         description: Forbidden — only the president can change roles
 *       404:
 *         description: User is not a member of this club
 */
router.patch(
  "/clubs/:clubId/members/:userId/role",
  authMiddleware,
  requireClubRole("president"),
  clubController.updateMemberRole,
);

/**
 * @openapi
 * /api/clubs/{clubId}/members/{userId}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: Remove a member from a club (president only)
 *     tags:
 *       - Clubs
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized - missing or invalid JWT
 *       403:
 *         description: Forbidden — only the president can remove members
 *       404:
 *         description: User is not a member of this club
 */
router.delete(
  "/clubs/:clubId/members/:userId",
  authMiddleware,
  requireClubRole("president"),
  clubController.removeMember,
);

export default router;
