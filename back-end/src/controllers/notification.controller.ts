import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ServiceError } from '../services/club.service';

function handleError(res: Response, error: unknown, context: string) {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(
    `${context} failed:`,
    error instanceof Error ? error.message : error,
  );
  return res.status(500).json({ error: 'Internal server error' });
}

export async function listNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const unread = req.query.unread === 'true' || req.query.unread === '1';
    const limit = parseIntQuery(req.query.limit);
    const offset = parseIntQuery(req.query.offset);

    const notifications = await notificationService.listForUser(userId, {
      unreadOnly: unread,
      limit,
      offset,
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    return handleError(res, error, 'List notifications');
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await notificationService.getUnreadCount(userId);
    return res.status(200).json({ count });
  } catch (error) {
    return handleError(res, error, 'Get unread count');
  }
}

export async function markRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await notificationService.markRead(req.params.id, userId);
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    return handleError(res, error, 'Mark notification read');
  }
}

export async function markAllRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const updated = await notificationService.markAllRead(userId);
    return res.status(200).json({ updated });
  } catch (error) {
    return handleError(res, error, 'Mark all notifications read');
  }
}

export async function deleteNotification(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await notificationService.deleteNotification(req.params.id, userId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, 'Delete notification');
  }
}

export async function runEventReminderScan(req: Request, res: Response) {
  try {
    const expected = process.env.NOTIFICATIONS_CRON_SECRET;
    if (!expected) {
      return res.status(503).json({
        error:
          'Event reminder scan is disabled. Set NOTIFICATIONS_CRON_SECRET to enable.',
      });
    }

    const provided =
      (req.headers['x-cron-secret'] as string | undefined) ??
      extractBearer(req.headers.authorization);

    if (!provided || provided !== expected) {
      return res.status(401).json({ error: 'Invalid cron secret' });
    }

    const lookaheadHours = parseIntQuery(req.query.lookaheadHours) ?? 24;
    const windowMinutes = parseIntQuery(req.query.windowMinutes) ?? 60;

    const result = await notificationService.runEventReminderScan({
      lookaheadHours,
      windowMinutes,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, 'Run event reminder scan');
  }
}

function parseIntQuery(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

function extractBearer(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const parts = header.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
  return undefined;
}
