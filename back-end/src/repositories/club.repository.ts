import type { PoolClient } from "pg";
import type { Club, UpdateClubDTO } from "../entities/club.entity";
import pool from "../db";
import { ClubRole } from "../entities/club-member.entity";

export async function createClub(
  client: PoolClient,
  name: string,
  description: string | null,
  sharedDriveLink: string | null,
  clubColor: string,
  type: string,
): Promise<Club> {
  const result = await client.query(
    `INSERT INTO "Clubs" (name, description, shared_drive_link, club_color, type) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, sharedDriveLink, clubColor, type],
  );

  return result.rows[0];
}

export async function addClubAdmin(
  client: PoolClient,
  clubId: string,
  userId: string,
): Promise<void> {
  await client.query(
    `INSERT INTO "Club_Members" (club_id, user_id, role) 
     VALUES ($1, $2, 'president')`,
    [clubId, userId],
  );
}

export async function getAllClubsForUser(userId: string) {
  const result = await pool.query(
    `SELECT
        c.club_id,
        c.name,
        c.description,
        c.shared_drive_link,
        c.club_color,
        c.type,
        COUNT(DISTINCT cm.user_id) AS member_count,
        COUNT(DISTINCT e.event_id) FILTER (
          WHERE LOWER(COALESCE(e.status, '')) = 'ongoing'
        ) AS ongoing_event_count
     FROM "Clubs" c
     JOIN "Club_Members" my_cm
       ON c.club_id = my_cm.club_id
      AND my_cm.user_id = $1
     LEFT JOIN "Club_Members" cm
       ON c.club_id = cm.club_id
     LEFT JOIN "Events" e
       ON c.club_id = e.club_id
     GROUP BY c.club_id
     ORDER BY c.name`,
    [userId],
  );

  return result.rows;
}

export async function getClubByJoinCode(
  joinCode: string,
): Promise<Club | null> {
  const result = await pool.query(
    `SELECT club_id, name, description, shared_drive_link, club_color, type
     FROM "Clubs"
     WHERE code = $1`,
    [joinCode],
  );

  return result.rows[0] || null;
}

export async function isUserInClub(
  userID: string,
  clubID: string,
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 
     FROM "Club_Members"
     WHERE user_id = $1 AND club_id = $2
     LIMIT 1`,
    [userID, clubID],
  );

  return result.rows.length > 0;
}

export async function joinClub(userID: string, clubID: string) {
  await pool.query(
    `INSERT INTO "Club_Members" ("club_id", "user_id", "role")
     VALUES ($1, $2, 'member')`,
    [clubID, userID]
  );
}

export async function leaveClub(userID: string, clubID: string) {
  await pool.query(
    `DELETE FROM "Club_Members" 
     WHERE "user_id" = $1 AND "club_id" = $2`,
    [userID, clubID],
  );
}

export async function getClubById(clubId: string) {
  const result = await pool.query(
    `SELECT
        c.club_id,
        c.name,
        c.description,
        c.shared_drive_link,
        c.club_color,
        c.type,
        c.banner_url,
        c.logo_url,
        c.discord_link,
        c.instagram_link,
        c.website_link,
        c.code AS join_code,
        COUNT(DISTINCT cm.user_id) AS member_count,
        COUNT(DISTINCT e.event_id) FILTER (
          WHERE LOWER(COALESCE(e.status, '')) = 'ongoing'
        ) AS ongoing_event_count
     FROM "Clubs" c
     LEFT JOIN "Club_Members" cm ON c.club_id = cm.club_id
     LEFT JOIN "Events" e ON c.club_id = e.club_id
     WHERE c.club_id = $1
     GROUP BY c.club_id`,
    [clubId],
  );

  return result.rows[0] ?? null;
}

export async function getClubMembers(clubId: string) {
  const result = await pool.query(
    `SELECT
        cm.user_id,
        CASE
          WHEN LOWER(cm.role) = 'president' THEN 'president'
          WHEN LOWER(cm.role) = 'vice_president' THEN 'vice_president'
          ELSE 'member'
        END AS role,
        cm.joined_at,
        u.name,
        u.email,
        u.profile_pic_url AS avatar
     FROM "Club_Members" cm
     JOIN "Users" u ON cm.user_id = u.user_id
     WHERE cm.club_id = $1
     ORDER BY
       CASE LOWER(cm.role)
         WHEN 'president' THEN 0
         WHEN 'vice_president' THEN 1
         ELSE 2
       END,
       cm.joined_at ASC`,
    [clubId]
  );

  return result.rows;
}

export async function getUserRoleInClub(
  userId: string,
  clubId: string,
): Promise<ClubRole | null> {
  const result = await pool.query(
    `SELECT
       CASE
         WHEN LOWER(role) = 'president' THEN 'president'
         WHEN LOWER(role) = 'vice_president' THEN 'vice_president'
         ELSE 'member'
       END AS role
     FROM "Club_Members"
     WHERE user_id = $1 AND club_id = $2
     LIMIT 1`,
    [userId, clubId],
  );

  return (result.rows[0]?.role as ClubRole) ?? null;
}

export async function updateClub(clubId: string, data: UpdateClubDTO) {
  const allowedFields: Record<string, string> = {
    name: 'name',
    description: 'description',
    shared_drive_link: 'shared_drive_link',
    type: 'type',
    club_color: 'club_color',
    banner_url: 'banner_url',
    logo_url: 'logo_url',
    discord_link: 'discord_link',
    instagram_link: 'instagram_link',
    website_link: 'website_link',
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, column] of Object.entries(allowedFields)) {
    if (key in data) {
      setClauses.push(`"${column}" = $${paramIndex}`);
      values.push((data as Record<string, unknown>)[key] ?? null);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) return null;

  values.push(clubId);

  const result = await pool.query(
    `UPDATE "Clubs"
     SET ${setClauses.join(', ')}
     WHERE club_id = $${paramIndex}
     RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteClub(
  client: PoolClient,
  clubId: string,
): Promise<void> {
  await client.query(
    `DELETE FROM "Club_Members_Contributions" WHERE club_id = $1`,
    [clubId],
  );
  await client.query(
    `DELETE FROM "Task_Assignees"
     WHERE task_id IN (
       SELECT task_id
       FROM "Tasks"
       WHERE event_id IN (
         SELECT event_id FROM "Events" WHERE club_id = $1
       )
     )`,
    [clubId],
  );
  await client.query(
    `DELETE FROM "Tasks"
     WHERE event_id IN (
       SELECT event_id FROM "Events" WHERE club_id = $1
     )`,
    [clubId],
  );
  await client.query(
    `DELETE FROM "Event_Logistics"
     WHERE event_id IN (
       SELECT event_id FROM "Events" WHERE club_id = $1
     )`,
    [clubId],
  );
  await client.query(
    `DELETE FROM "Event_Attendees"
     WHERE event_id IN (
       SELECT event_id FROM "Events" WHERE club_id = $1
     )`,
    [clubId],
  );
  await client.query(`DELETE FROM "Events" WHERE club_id = $1`, [clubId]);
  await client.query(`DELETE FROM "Club_Members" WHERE club_id = $1`, [clubId]);
  await client.query(`DELETE FROM "Clubs" WHERE club_id = $1`, [clubId]);
}

export async function updateMemberRole(
  clubId: string,
  userId: string,
  role: string,
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE "Club_Members" SET role = $1 WHERE club_id = $2 AND user_id = $3`,
    [role, clubId, userId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateMemberRoleTx(
  client: PoolClient,
  clubId: string,
  userId: string,
  role: string,
): Promise<boolean> {
  const result = await client.query(
    `UPDATE "Club_Members" SET role = $1 WHERE club_id = $2 AND user_id = $3`,
    [role, clubId, userId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function demoteOtherPresidents(
  client: PoolClient,
  clubId: string,
  excludeUserId: string,
): Promise<void> {
  await client.query(
    `UPDATE "Club_Members"
     SET role = 'vice_president'
     WHERE club_id = $1
       AND role = 'president'
       AND user_id <> $2`,
    [clubId, excludeUserId],
  );
}

export async function removeMember(
  clubId: string,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM "Club_Members" WHERE club_id = $1 AND user_id = $2`,
    [clubId, userId],
  );
  return (result.rowCount ?? 0) > 0;
}