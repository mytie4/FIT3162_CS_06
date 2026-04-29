import pool from "../db";
import * as clubRepo from "../repositories/club.repository";
import type {
  CreateClubDTO,
  UpdateClubDTO,
  Club,
} from "../entities/club.entity";

export async function createClub(
  data: CreateClubDTO,
  userId: string,
): Promise<Club> {
  const name = data.name?.trim();
  const description = data.description?.trim() ?? null;
  const sharedDriveLink = data.shared_drive_link?.trim() ?? null;
  const type = data.type?.trim();

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
      type,
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

export async function joinClub(userID: string, joinCode: string) {
  const club = await clubRepo.getClubByJoinCode(joinCode);
  if (!club) {
    throw new Error("Invalid join code");
  }

  const clubID = club.club_id;

  const alreadyMember = await clubRepo.isUserInClub(userID, clubID);
  if (alreadyMember) {
    throw new Error("User is already a member of this club");
  }

  await clubRepo.joinClub(userID, clubID);
}

export async function leaveClub(userID: string, clubID: string) {
  const alreadyMember = await clubRepo.isUserInClub(userID, clubID);
  if (!alreadyMember) {
    throw new Error("User is not in this club");
  }
  await clubRepo.leaveClub(userID, clubID);
}
export async function getAllClubsForUser(userId: string) {
  if (!userId) {
    throw new ServiceError(401, "Unauthorized");
  }

  const result = await clubRepo.getAllClubsForUser(userId);

  return result.map((club) => ({
    ...club,
    member_count: Number(club.member_count),
    ongoing_event_count: Number(club.ongoing_event_count),
  }));
}

export async function getClubById(clubId: string) {
  if (!clubId) {
    throw new ServiceError(400, "Club ID is required.");
  }

  const club = await clubRepo.getClubById(clubId);
  if (!club) {
    throw new ServiceError(404, "Club not found.");
  }

  return {
    ...club,
    member_count: Number(club.member_count),
    ongoing_event_count: Number(club.ongoing_event_count),
  };
}

export async function getClubMembers(clubId: string) {
  if (!clubId) {
    throw new ServiceError(400, "Club ID is required.");
  }

  // Verify club exists
  const club = await clubRepo.getClubById(clubId);
  if (!club) {
    throw new ServiceError(404, "Club not found.");
  }

  return await clubRepo.getClubMembers(clubId);
}

export async function getUserRoleInClub(userId: string, clubId: string) {
  if (!userId || !clubId) {
    throw new ServiceError(400, "User ID and Club ID are required.");
  }

  return await clubRepo.getUserRoleInClub(userId, clubId);
}

const VALID_ROLES = ["president", "vice_president", "member"] as const;

export async function updateClub(
  clubId: string,
  data: UpdateClubDTO,
  userId: string,
) {
  if (!clubId) throw new ServiceError(400, "Club ID is required.");

  const ALLOWED_EDIT_ROLES = ["president", "vice_president"];
  const role = await clubRepo.getUserRoleInClub(userId, clubId);
  if (!role || !ALLOWED_EDIT_ROLES.includes(role)) {
    throw new ServiceError(
      403,
      "Only the president or vice president can update club settings.",
    );
  }

  const updatableFields: (keyof UpdateClubDTO)[] = [
    "name",
    "description",
    "shared_drive_link",
    "type",
    "club_color",
  ];
  const hasUpdatableFields = updatableFields.some((f) => data[f] !== undefined);
  if (!hasUpdatableFields) {
    throw new ServiceError(400, "No valid fields provided to update.");
  }

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) throw new ServiceError(400, "Club name is required.");
    if (trimmed.length > 100)
      throw new ServiceError(
        400,
        "Club name should be 100 characters or less.",
      );
    data.name = trimmed;
  }

  if (
    data.description !== undefined &&
    data.description &&
    data.description.length > 500
  ) {
    throw new ServiceError(
      400,
      "Description should be 500 characters or less.",
    );
  }

  const updated = await clubRepo.updateClub(clubId, data);
  if (!updated) throw new ServiceError(404, "Club not found.");

  return updated;
}

export async function deleteClub(clubId: string, userId: string) {
  if (!clubId) throw new ServiceError(400, "Club ID is required.");

  const role = await clubRepo.getUserRoleInClub(userId, clubId);
  if (role !== "president") {
    throw new ServiceError(403, "Only the president can delete the club.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await clubRepo.deleteClub(client, clubId);
    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback failed:", e);
    }
    throw error instanceof Error ? error : new Error("Unknown error occurred.");
  } finally {
    client.release();
  }
}

export async function updateMemberRole(
  clubId: string,
  targetUserId: string,
  newRole: string,
  requesterId: string,
) {
  if (!clubId || !targetUserId || !newRole) {
    throw new ServiceError(400, "Club ID, user ID, and role are required.");
  }

  if (!VALID_ROLES.includes(newRole as (typeof VALID_ROLES)[number])) {
    throw new ServiceError(
      400,
      `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
    );
  }

  const requesterRole = await clubRepo.getUserRoleInClub(requesterId, clubId);
  if (requesterRole !== "president") {
    throw new ServiceError(403, "Only the president can change member roles.");
  }

  if (targetUserId === requesterId && newRole !== "president") {
    throw new ServiceError(
      400,
      "You cannot demote yourself. Transfer presidency first.",
    );
  }

  const targetInClub = await clubRepo.isUserInClub(targetUserId, clubId);
  if (!targetInClub) {
    throw new ServiceError(404, "User is not a member of this club.");
  }

  // Promoting to president is a transfer: demote every existing president in the
  // club first so the single-president partial unique index is never violated.
  if (newRole === "president") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await clubRepo.demoteOtherPresidents(client, clubId, targetUserId);
      const updated = await clubRepo.updateMemberRoleTx(
        client,
        clubId,
        targetUserId,
        newRole,
      );
      if (!updated) {
        throw new ServiceError(500, "Failed to update role.");
      }
      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (e) {
        console.error("Rollback failed:", e);
      }
      throw error instanceof Error
        ? error
        : new Error("Unknown error occurred.");
    } finally {
      client.release();
    }
    return;
  }

  const updated = await clubRepo.updateMemberRole(
    clubId,
    targetUserId,
    newRole,
  );
  if (!updated) throw new ServiceError(500, "Failed to update role.");
}

export async function removeMember(
  clubId: string,
  targetUserId: string,
  requesterId: string,
) {
  if (!clubId || !targetUserId) {
    throw new ServiceError(400, "Club ID and user ID are required.");
  }

  const requesterRole = await clubRepo.getUserRoleInClub(requesterId, clubId);
  if (requesterRole !== "president") {
    throw new ServiceError(403, "Only the president can remove members.");
  }

  if (targetUserId === requesterId) {
    throw new ServiceError(
      400,
      "You cannot remove yourself. Use leave club instead.",
    );
  }

  const targetInClub = await clubRepo.isUserInClub(targetUserId, clubId);
  if (!targetInClub) {
    throw new ServiceError(404, "User is not a member of this club.");
  }

  const removed = await clubRepo.removeMember(clubId, targetUserId);
  if (!removed) throw new ServiceError(500, "Failed to remove member.");
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
