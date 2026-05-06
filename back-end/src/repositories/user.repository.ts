import pool from '../db';
import type { User } from '../entities/user.entity';

export async function findByEmail(
  email: string,
): Promise<User | null> {
  const result = await pool.query(
    `SELECT "user_id", "name", "email", "password_hash",
            "profile_pic_url", "wants_email_reminders"
     FROM "Users"
     WHERE LOWER("email") = LOWER($1)
     LIMIT 1`,
    [email],
  );

  return result.rowCount === 0 ? null : result.rows[0];
}

export async function emailExists(email: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1
     FROM "Users"
     WHERE LOWER("email") = LOWER($1)
     LIMIT 1`,
    [email],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<Omit<User, 'password_hash'>> {
  const result = await pool.query(
    `INSERT INTO "Users" ("name", "email", "password_hash")
     VALUES ($1, $2, $3)
     RETURNING
        "user_id",
        "name",
        "email",
        "profile_pic_url",
        "wants_email_reminders"`,
    [name, email, passwordHash],
  );

  return result.rows[0];
}

export async function findById(
  userId: string,
): Promise<Pick<User, 'user_id' | 'name' | 'email' | 'profile_pic_url'> | null> {
  const result = await pool.query(
    `SELECT "user_id", "name", "email", "profile_pic_url"
     FROM "Users"
     WHERE "user_id" = $1
     LIMIT 1`,
    [userId],
  );

  return result.rowCount === 0 ? null : result.rows[0];
}

export interface UserSearchResult {
  user_id: string;
  name: string;
  email: string;
  profile_pic_url: string | null;
}

export interface UserSearchOptions {
  /** Optional club whose existing members should be excluded from results. */
  excludeClubId?: string;
  /** Optional user_id to exclude (typically the requester themselves). */
  excludeUserId?: string;
  /** Hard cap on rows returned. Caller should pass a small number. */
  limit: number;
}

/**
 * Substring-match users by name or email. Intended for "invite a member"
 * pickers and similar UIs. Always limited; never returns password hashes.
 *
 * The query is treated as a literal substring (LIKE wildcards `%` and `_`
 * are escaped) so callers can pass raw user input safely.
 */
export async function searchUsers(
  query: string,
  options: UserSearchOptions,
): Promise<UserSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const escaped = trimmed.replace(/[\\%_]/g, (ch) => `\\${ch}`);
  const pattern = `%${escaped}%`;

  const params: unknown[] = [pattern];
  const conditions: string[] = [
    `(u."name" ILIKE $1 OR u."email" ILIKE $1)`,
  ];

  if (options.excludeUserId) {
    params.push(options.excludeUserId);
    conditions.push(`u."user_id" <> $${params.length}`);
  }

  if (options.excludeClubId) {
    params.push(options.excludeClubId);
    conditions.push(
      `NOT EXISTS (
         SELECT 1 FROM "Club_Members" cm
         WHERE cm."user_id" = u."user_id"
           AND cm."club_id" = $${params.length}
       )`,
    );
  }

  params.push(options.limit);
  const limitPlaceholder = `$${params.length}`;

  const result = await pool.query(
    `SELECT u."user_id", u."name", u."email", u."profile_pic_url"
       FROM "Users" u
      WHERE ${conditions.join(' AND ')}
      ORDER BY u."name" ASC
      LIMIT ${limitPlaceholder}`,
    params,
  );

  return result.rows;
}

export async function checkDbConnection(): Promise<string> {
  const result = await pool.query('SELECT NOW()');
  return result.rows[0].now;
}
