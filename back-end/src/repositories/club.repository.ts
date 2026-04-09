import type { PoolClient } from "pg";
import type { Club } from "../entities/club.entity";

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
