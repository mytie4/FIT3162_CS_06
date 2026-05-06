import type { Response } from 'express';

import type { AuthRequest } from '../middlewares/auth.middleware';
import {
  searchPlatformUsers,
  ServiceError,
} from '../services/user.service';

export async function searchUsers(req: AuthRequest, res: Response) {
  try {
    const requesterId = req.user?.user_id;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
    const excludeClubId =
      typeof req.query.clubId === 'string' && req.query.clubId.length > 0
        ? req.query.clubId
        : undefined;
    const rawLimit =
      typeof req.query.limit === 'string'
        ? Number.parseInt(req.query.limit, 10)
        : undefined;

    const users = await searchPlatformUsers({
      query: rawQuery,
      requesterId,
      excludeClubId,
      limit: rawLimit,
    });

    return res.status(200).json({ users });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('User search failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
