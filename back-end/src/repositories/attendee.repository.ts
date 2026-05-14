import pool from '../db';
import { Attendee } from '../entities/attendee.entity';

const SELECT_ATTENDEE = `
  SELECT
      a.event_id,
      a.user_id,
      u.name           AS user_name,
      u.email          AS user_email,
      u.profile_pic_url AS user_avatar,
      CASE
        WHEN LOWER(cm.role) = 'president' THEN 'president'
        WHEN LOWER(cm.role) = 'vice_president' THEN 'vice_president'
        WHEN cm.role IS NOT NULL THEN 'member'
        ELSE NULL
      END              AS club_role,
      a.registered_at
   FROM "Event_Attendees" a
   LEFT JOIN "Users" u ON u.user_id = a.user_id
   LEFT JOIN "Events" e ON e.event_id = a.event_id
   LEFT JOIN "Club_Members" cm
     ON cm.user_id = a.user_id AND cm.club_id = e.club_id
`;

export async function getAttendeesByEventId(
  eventId: string,
): Promise<Attendee[]> {
  const res = await pool.query<Attendee>(
    `${SELECT_ATTENDEE}
     WHERE a.event_id = $1
     ORDER BY a.registered_at ASC`,
    [eventId],
  );
  return res.rows;
}

export async function getAttendeeByEventAndUser(
  eventId: string,
  userId: string,
): Promise<Attendee | null> {
  const res = await pool.query<Attendee>(
    `${SELECT_ATTENDEE}
     WHERE a.event_id = $1 AND a.user_id = $2`,
    [eventId, userId],
  );
  return res.rows[0] ?? null;
}

export async function createAttendee(
  eventId: string,
  userId: string,
): Promise<Attendee> {
  await pool.query(
    `INSERT INTO "Event_Attendees" (event_id, user_id)
     VALUES ($1, $2)`,
    [eventId, userId],
  );
  const created = await getAttendeeByEventAndUser(eventId, userId);
  if (!created) {
    throw new Error('Failed to load just-created attendee.');
  }
  return created;
}

export async function deleteAttendee(
  eventId: string,
  userId: string,
): Promise<boolean> {
  const res = await pool.query(
    `DELETE FROM "Event_Attendees"
     WHERE event_id = $1 AND user_id = $2`,
    [eventId, userId],
  );
  return (res.rowCount ?? 0) > 0;
}
