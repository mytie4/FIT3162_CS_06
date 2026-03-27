import type { Request, Response } from 'express';

import { checkDbConnection } from '../repositories/user.repository';

export function healthCheck(_req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}

export async function dbHealthCheck(_req: Request, res: Response) {
  try {
    const timestamp = await checkDbConnection();
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp,
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
}
