import type { PoolClient } from 'pg';
import pool from '../db';
import type {
  CreateNotificationDTO,
  ListNotificationsOptions,
  Notification,
} from '../entities/notification.entity';

type Querier = Pick<PoolClient, 'query'> | typeof pool;

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const NOTIFICATION_COLUMNS = `
  notification_id,
  user_id,
  type,
  title,
  message,
  metadata,
  read,
  created_at,
  sender_name,
  club_name,
  event_name,
  club_id,
  event_id
`;

export async function createNotification(
  dto: CreateNotificationDTO,
  client?: PoolClient,
): Promise<Notification> {
  const querier: Querier = client ?? pool;

  const result = await querier.query(
    `INSERT INTO "Notifications"
       (user_id, type, title, message, metadata,
        club_id, event_id, sender_name, club_name, event_name)
     VALUES
       ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
     RETURNING ${NOTIFICATION_COLUMNS}`,
    [
      dto.user_id,
      dto.type,
      dto.title,
      dto.message ?? null,
      JSON.stringify(dto.metadata ?? {}),
      dto.club_id ?? null,
      dto.event_id ?? null,
      dto.sender_name ?? null,
      dto.club_name ?? null,
      dto.event_name ?? null,
    ],
  );

  return result.rows[0];
}

export async function listForUser(
  userId: string,
  options: ListNotificationsOptions = {},
): Promise<Notification[]> {
  const limit = clampLimit(options.limit);
  const offset = Math.max(0, options.offset ?? 0);

  const params: unknown[] = [userId];
  let where = `WHERE user_id = $1`;

  if (options.unreadOnly) {
    where += ` AND read = FALSE`;
  }

  params.push(limit, offset);

  const result = await pool.query(
    `SELECT ${NOTIFICATION_COLUMNS}
     FROM "Notifications"
     ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return result.rows;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM "Notifications"
     WHERE user_id = $1 AND read = FALSE`,
    [userId],
  );

  return result.rows[0]?.count ?? 0;
}

export async function markRead(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE "Notifications"
     SET read = TRUE
     WHERE notification_id = $1 AND user_id = $2`,
    [notificationId, userId],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function markAllRead(userId: string): Promise<number> {
  const result = await pool.query(
    `UPDATE "Notifications"
     SET read = TRUE
     WHERE user_id = $1 AND read = FALSE`,
    [userId],
  );

  return result.rowCount ?? 0;
}

export async function deleteNotification(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM "Notifications"
     WHERE notification_id = $1 AND user_id = $2`,
    [notificationId, userId],
  );

  return (result.rowCount ?? 0) > 0;
}

export interface UpcomingEventReminder {
  event_id: string;
  event_title: string;
  event_date: string;
  club_id: string;
  club_name: string;
  user_id: string;
}

// Returns one row per (upcoming event, attendee) for events whose start time
// falls inside the supplied lookahead window AND for which a reminder has not
// already been emitted to that attendee.
export async function findEventsNeedingReminders(
  windowStart: Date,
  windowEnd: Date,
): Promise<UpcomingEventReminder[]> {
  const result = await pool.query(
    `SELECT
        e.event_id,
        e.title       AS event_title,
        e.date        AS event_date,
        c.club_id     AS club_id,
        c.name        AS club_name,
        ea.user_id    AS user_id
     FROM "Events" e
     JOIN "Clubs" c ON c.club_id = e.club_id
     JOIN "Event_Attendees" ea ON ea.event_id = e.event_id
     WHERE e.date BETWEEN $1 AND $2
       AND ea.rsvp_status IN ('going', 'interested')
       AND NOT EXISTS (
         SELECT 1 FROM "Notifications" n
         WHERE n.user_id = ea.user_id
           AND n.type = 'event_reminder'
           AND n.event_id = e.event_id
       )`,
    [windowStart.toISOString(), windowEnd.toISOString()],
  );

  return result.rows;
}

export async function getClubMemberIds(clubId: string): Promise<string[]> {
  const result = await pool.query(
    `SELECT user_id FROM "Club_Members" WHERE club_id = $1`,
    [clubId],
  );

  return result.rows.map((r) => r.user_id as string);
}

/**
 * Returns the subset of `userIds` that already have an unread `club_invite`
 * notification for the given club. Used to make invitation sending
 * idempotent — calling the endpoint twice should not enqueue two pings.
 */
export async function findUsersWithPendingClubInvite(
  clubId: string,
  userIds: string[],
): Promise<string[]> {
  if (userIds.length === 0) return [];

  const result = await pool.query(
    `SELECT DISTINCT user_id
     FROM "Notifications"
     WHERE type = 'club_invite'
       AND read = FALSE
       AND club_id = $1
       AND user_id = ANY($2::uuid[])`,
    [clubId, userIds],
  );

  return result.rows.map((r) => r.user_id as string);
}

function clampLimit(input?: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(input), MAX_LIMIT);
}
