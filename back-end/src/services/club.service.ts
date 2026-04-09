import pool from "../db";
import * as clubRepo from "../repositories/club.repository";
import type { CreateClubDTO, Club } from "../entities/club.entity";

export async function createClub(
  data: CreateClubDTO,
  userId: string,
): Promise<Club> {
  const name = data.name?.trim();
  const description = data.description?.trim() ?? null;
  const sharedDriveLink = data.shared_drive_link?.trim() ?? null;

  if (!name) {
    throw new ServiceError(400, "Club name is required.");
  }

  if (name.length > 100) {
    throw new ServiceError(400, "Club name should be 100 characters or less.");
  }

  if (description && description.length > 500) {
    throw new ServiceError(
      400,
      "Description should be 500 characters or less.",
    );
  }

  if (sharedDriveLink) {
    try {
      new URL(sharedDriveLink);
    } catch {
      throw new ServiceError(400, "Invalid shared drive link URL.");
    }
  }

  if (!userId) {
    throw new ServiceError(400, "User ID is required.");
  }

  const client = await pool.connect();

  try {
    // begin transaction
    await client.query("BEGIN");

    const DEFAULT_COLORS = [
      "#F36D8A",
      "#25A9EF",
      "#3942F4",
      "#9B7CF3",
      "#F4BF39",
      "#FD59C0",
      "#39F4D5",
      "#8CF57E",
    ];

    const clubColor =
      DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

    const club = await clubRepo.createClub(
      client,
      name,
      description,
      sharedDriveLink,
      clubColor,
    );

    await clubRepo.addClubAdmin(client, club.club_id, userId);

    // permanently save changes
    await client.query("COMMIT");

    return club;
  } catch (error) {
    // reverse changes if required
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    console.error("Transaction failed:", error);

    throw error instanceof Error ? error : new Error("Unknown error occurred.");
  } finally {
    client.release();
  }
}

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
