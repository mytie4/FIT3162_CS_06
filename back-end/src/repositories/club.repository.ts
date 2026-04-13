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


export async function getClubByJoinCode(joinCode: number): Promise<Club | null> {
    const result = await pool.query(
        `SELECT club_id, name, description, shared_drive_link, club_color
         FROM "Clubs"
         WHERE code = $1`,
        [joinCode]
    );

    return result.rows[0] || null;
}

export async function isUserInClub(userID: string, clubID: string): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1 
         FROM "Club_Members"
         WHERE user_id = $1 AND club_id = $2
         LIMIT 1`,
        [userID, clubID]
    );

    return result.rows.length > 0;
}

export async function joinClub(userID: string, clubID: string) {
    await pool.query(
        `INSERT INTO "Club_Members" ("club_id", "user_id", "role")
         VALUES ($1, $2, 'Member')`,
        [clubID, userID]
    );
}

export async function leaveClub(userID: string, clubID: string){
  const result = await pool.query(
    `DELETE FROM "Club_Members" 
    WHERE "user_id" = $1 AND "club_id" = $2`, [userID, clubID])   
}