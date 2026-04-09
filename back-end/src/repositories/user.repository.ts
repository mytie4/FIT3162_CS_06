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

export async function checkDbConnection(): Promise<string> {
  const result = await pool.query('SELECT NOW()');
  return result.rows[0].now;
}
