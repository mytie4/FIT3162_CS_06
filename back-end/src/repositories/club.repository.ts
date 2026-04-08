import type { PoolClient } from "pg";
import type { Club } from "../entities/club.entity";

export async function createClub(
  client: PoolClient,
  name: string,
  description: string | null,
  sharedDriveLink: string | null,
): Promise<Club> {
  const result = await client.query(
    `INSERT INTO "Clubs" (club_id, name, description, shared_drive_link) 
    VALUES ((SELECT COALESCE(MAX("club_id"), 0) + 1 FROM "Clubs"), $1, $2, $3)
    RETURNING *`,
    [name, description, sharedDriveLink],
  );

  return result.rows[0];
}

export async function addClubAdmin(
  client: PoolClient,
  clubId: number,
  userId: number,
): Promise<void> {
  const result = await client.query(
    `INSERT INTO "Club_Members" (club_id, user_id, role) 
    VALUES ($1, $2, 'admin')`,
    [clubId, userId],
  );
}
