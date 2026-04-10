import type { PoolClient } from "pg";
import type { Club } from "../entities/club.entity";
import pool from '../db';

export async function createClub(
  client: PoolClient,
  name: string,
  description: string | null,
  sharedDriveLink: string | null,
  clubColor: string,
): Promise<Club> {
  const result = await client.query(
    `INSERT INTO "Clubs" (name, description, shared_drive_link, club_color) 
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [name, description, sharedDriveLink, clubColor],
  );

  return result.rows[0];
}

export async function addClubAdmin(
  client: PoolClient,
  clubId: string,
  userId: string,
): Promise<void> {
  const result = await client.query(
    `INSERT INTO "Club_Members" (club_id, user_id, role) 
    VALUES ($1, $2, 'admin')`,
    [clubId, userId],
  );
}

export async function getAllClubs() {
  const result = await pool.query(
    `SELECT
        c.club_id,
        c.name,
        c.description,
        c.shared_drive_link,
        c.club_color,
        COUNT (DISTINCT cm.user_id) AS member_count,
        COUNT (DISTINCT e.event_id) FILTER (WHERE e.status = 'ongoing') AS ongoing_event_count
    FROM "Clubs" c
    LEFT JOIN "Club_Members" cm ON c.club_id = cm.club_id
    LEFT JOIN "Events" e ON c.club_id = e.club_id
    GROUP BY c.club_id
    `
  )

  return result.rows;
}