import pool from "../db";
import {
  Event,
  EventWithClubName,
  CreateEventDTO,
  UpdateEventDTO,
} from "../entities/event.entity";

export async function createEvent(
  dto: CreateEventDTO,
  createdBy: string,
): Promise<Event> {
  const result = await pool.query(
    `INSERT INTO "Events"
      (
        club_id,
        title,
        type,
        date,
        end_date,
        location,
        description,
        banner_url,
        budget,
        status,
        created_by
      )
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      dto.club_id,
      dto.title,
      dto.type ?? null,
      dto.date ?? null,
      dto.end_date ?? null,
      dto.location ?? null,
      dto.description ?? null,
      dto.banner_url ?? null,
      dto.budget ?? null,
      dto.status ?? "draft",
      createdBy,
    ],
  );

  return result.rows[0];
}

export async function getEventById(
  eventId: string,
): Promise<EventWithClubName | null> {
  const result = await pool.query(
    `SELECT
        e.*,
        c.name AS club_name,
        COUNT(DISTINCT ea.user_id) AS attendee_count
     FROM "Events" e
     JOIN "Clubs" c
       ON e.club_id = c.club_id
     LEFT JOIN "Event_Attendees" ea
       ON e.event_id = ea.event_id
      AND ea.rsvp_status = 'going'
     WHERE e.event_id = $1
     GROUP BY e.event_id, c.club_id, c.name`,
    [eventId],
  );

  return result.rows[0] ?? null;
}

export async function getEventsByClubId(
  clubId: string,
): Promise<EventWithClubName[]> {
  const result = await pool.query(
    `SELECT
        e.*,
        c.name AS club_name,
        COUNT(DISTINCT ea.user_id) AS attendee_count
     FROM "Events" e
     JOIN "Clubs" c
       ON e.club_id = c.club_id
     LEFT JOIN "Event_Attendees" ea
       ON e.event_id = ea.event_id
      AND ea.rsvp_status = 'going'
     WHERE e.club_id = $1
     GROUP BY e.event_id, c.club_id, c.name
     ORDER BY e.date DESC NULLS LAST`,
    [clubId],
  );

  return result.rows;
}

export async function updateEvent(
  eventId: string,
  dto: UpdateEventDTO,
): Promise<Event | null> {
  const allowedFields: Record<string, string> = {
    title: "title",
    type: "type",
    date: "date",
    end_date: "end_date",
    location: "location",
    description: "description",
    banner_url: "banner_url",
    budget: "budget",
    status: "status",
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, column] of Object.entries(allowedFields)) {
    if (key in dto) {
      setClauses.push(`"${column}" = $${paramIndex}`);
      values.push((dto as Record<string, unknown>)[key] ?? null);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) return null;

  values.push(eventId);

  const result = await pool.query(
    `UPDATE "Events"
     SET ${setClauses.join(", ")}
     WHERE event_id = $${paramIndex}
     RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await pool.query(`DELETE FROM "Events" WHERE event_id = $1`, [eventId]);
}

export async function getAllEvents(
  userId: string,
): Promise<EventWithClubName[]> {
  const result = await pool.query(
    `SELECT
        e.*,
        c.name AS club_name,
        COUNT(DISTINCT ea.user_id) FILTER (
          WHERE ea.rsvp_status = 'going'
        ) AS attendee_count
     FROM "Events" e
     JOIN "Clubs" c
       ON e.club_id = c.club_id
     LEFT JOIN "Event_Attendees" ea
       ON e.event_id = ea.event_id
     LEFT JOIN "Event_Attendees" my_ea
       ON e.event_id = my_ea.event_id
      AND my_ea.user_id = $1
     WHERE my_ea.user_id IS NOT NULL
        OR e.created_by = $1
     GROUP BY e.event_id, c.club_id, c.name
     ORDER BY e.date DESC NULLS LAST`,
    [userId],
  );

  return result.rows;
}