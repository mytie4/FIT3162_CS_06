import { Router } from "express";
import * as clubController from "../controllers/club.controller";

const router = Router();

/**
 * @openapi
 * /api/clubs:
 *   post:
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/clubs", clubController.createClub);

export default router;
