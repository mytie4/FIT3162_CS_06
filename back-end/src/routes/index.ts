import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = Router();
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: API health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @openapi
 * /api/health/db:
 *   get:
 *     summary: Database health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Database is connected
 *       500:
 *         description: Database is disconnected
 */
router.get('/health/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown database error';
    console.error('Database health check failed:', errorMessage);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: 'Internal server error',
    });
  }
});

/**
 * @openapi
 * /api/register:
 *   post:
 *     summary: Register a new user account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account created successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
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
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    const trimmedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required',
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const existingUser = await pool.query(
      `SELECT 1
       FROM "Users"
       WHERE LOWER("email") = LOWER($1)
       LIMIT 1`,
      [normalizedEmail],
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return res.status(409).json({
        error: 'Email is already registered',
      });
    }

    const result = await pool.query(
      `INSERT INTO "Users" (
          "user_id",
          "name",
          "email",
          "password_hash",
          "profile_pic_url",
          "wants_email_reminders"
        )
       VALUES (
          (SELECT COALESCE(MAX("user_id"), 0) + 1 FROM "Users"),
          $1,
          $2,
          $3,
          NULL,
          FALSE
       )
       RETURNING
          "user_id",
          "name",
          "email",
          "profile_pic_url",
          "wants_email_reminders"`,
      [trimmedName, normalizedEmail, passwordHash],
    );

    const createdUser = result.rows[0];

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        user_id: createdUser.user_id,
        name: createdUser.name,
        email: createdUser.email,
        profile_pic_url: createdUser.profile_pic_url,
        wants_email_reminders: createdUser.wants_email_reminders,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('Register failed:', errorMessage);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Log in with email and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const result = await pool.query(
      `SELECT "user_id", "name", "email", "password_hash",
              "profile_pic_url", "wants_email_reminders"
       FROM "Users"
       WHERE LOWER("email") = LOWER($1)
       LIMIT 1`,
      [normalizedEmail],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        profile_pic_url: user.profile_pic_url,
        wants_email_reminders: user.wants_email_reminders,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('Login failed:', errorMessage);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
