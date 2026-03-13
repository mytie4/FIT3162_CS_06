import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

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

export default router;
