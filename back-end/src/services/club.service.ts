import pool from '../db';
import * as clubRepo from '../repositories/club.repository';
import * as userRepo from '../repositories/user.repository';
import * as notificationRepo from '../repositories/notification.repository';
import * as notificationService from './notification.service';
import type {
  CreateClubDTO,
  UpdateClubDTO,
  Club,
} from '../entities/club.entity';

export async function createClub(
  data: CreateClubDTO,
  userId: string,
): Promise<Club> {
  const name = data.name?.trim();
  const description = data.description?.trim() ?? null;
  const sharedDriveLink = data.shared_drive_link?.trim() ?? null;
  const type = data.type?.trim();

  if (!name) {
    throw new ServiceError(400, 'Club name is required.');
  }

  if (name.length > 100) {
    throw new ServiceError(400, 'Club name should be 100 characters or less.');
  }

  if (description && description.length > 500) {
    throw new ServiceError(
      400,
      'Description should be 500 characters or less.',
    );
  }

  if (sharedDriveLink) {
    try {
      new URL(sharedDriveLink);
    } catch {
      throw new ServiceError(400, 'Invalid shared drive link URL.');
    }
  }

  if (!userId) {
    throw new ServiceError(400, 'User ID is required.');
  }

  const client = await pool.connect();

  try {
    // begin transaction
    await client.query('BEGIN');

    const DEFAULT_COLORS = [
      '#F36D8A',
      '#25A9EF',
      '#3942F4',
      '#9B7CF3',
      '#F4BF39',
      '#FD59C0',
      '#39F4D5',
      '#8CF57E',
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
    await client.query('COMMIT');

    return club;
  } catch (error) {
    // reverse changes if required
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }

    console.error('Transaction failed:', error);

    throw error instanceof Error ? error : new Error('Unknown error occurred.');
  } finally {
    client.release();
  }
}

export async function joinClub(userID: string, joinCode: string) {
  const club = await clubRepo.getClubByJoinCode(joinCode);
  if (!club) {
    throw new Error('Invalid join code');
  }

  const clubID = club.club_id;

  const alreadyMember = await clubRepo.isUserInClub(userID, clubID);
  if (alreadyMember) {
    throw new Error('User is already a member of this club');
  }

  await clubRepo.joinClub(userID, clubID);

  // Best-effort welcome notification. Distinct from emitClubInvite so the
  // recipient doesn't see a "join" button on their own welcome row.
  try {
    await notificationService.emitClubJoined({
      userId: userID,
      clubId: clubID,
      clubName: club.name,
    });
  } catch (err) {
    console.error('[notifications] club_joined wiring failed', err);
  }
}

export async function leaveClub(userID: string, clubID: string) {
  const alreadyMember = await clubRepo.isUserInClub(userID, clubID);
  if (!alreadyMember) {
    throw new Error('User is not in this club');
  }
  await clubRepo.leaveClub(userID, clubID);
}
export async function getAllClubsForUser(userId: string) {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized');
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
    throw new ServiceError(400, 'Club ID is required.');
  }

  const club = await clubRepo.getClubById(clubId);
  if (!club) {
    throw new ServiceError(404, 'Club not found.');
  }

  return {
    ...club,
    member_count: Number(club.member_count),
    ongoing_event_count: Number(club.ongoing_event_count),
  };
}

export async function getClubMembers(clubId: string) {
  if (!clubId) {
    throw new ServiceError(400, 'Club ID is required.');
  }

  // Verify club exists
  const club = await clubRepo.getClubById(clubId);
  if (!club) {
    throw new ServiceError(404, 'Club not found.');
  }

  return await clubRepo.getClubMembers(clubId);
}

export async function getUserRoleInClub(userId: string, clubId: string) {
  if (!userId || !clubId) {
    throw new ServiceError(400, 'User ID and Club ID are required.');
  }

  return await clubRepo.getUserRoleInClub(userId, clubId);
}

const VALID_ROLES = ['president', 'vice_president', 'member'] as const;

export async function updateClub(
  clubId: string,
  data: UpdateClubDTO,
  userId: string,
) {
  if (!clubId) throw new ServiceError(400, 'Club ID is required.');

  const ALLOWED_EDIT_ROLES = ['president', 'vice_president'];
  const role = await clubRepo.getUserRoleInClub(userId, clubId);
  if (!role || !ALLOWED_EDIT_ROLES.includes(role)) {
    throw new ServiceError(
      403,
      'Only the president or vice president can update club settings.',
    );
  }

  const updatableFields: (keyof UpdateClubDTO)[] = [
    'name',
    'description',
    'shared_drive_link',
    'type',
    'club_color',
  ];
  const hasUpdatableFields = updatableFields.some((f) => data[f] !== undefined);
  if (!hasUpdatableFields) {
    throw new ServiceError(400, 'No valid fields provided to update.');
  }

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) throw new ServiceError(400, 'Club name is required.');
    if (trimmed.length > 100)
      throw new ServiceError(
        400,
        'Club name should be 100 characters or less.',
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
      'Description should be 500 characters or less.',
    );
  }

  const updated = await clubRepo.updateClub(clubId, data);
  if (!updated) throw new ServiceError(404, 'Club not found.');

  return updated;
}

export async function deleteClub(clubId: string, userId: string) {
  if (!clubId) throw new ServiceError(400, 'Club ID is required.');

  const role = await clubRepo.getUserRoleInClub(userId, clubId);
  if (role !== 'president') {
    throw new ServiceError(403, 'Only the president can delete the club.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await clubRepo.deleteClub(client, clubId);
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      console.error('Rollback failed:', e);
    }
    throw error instanceof Error ? error : new Error('Unknown error occurred.');
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
    throw new ServiceError(400, 'Club ID, user ID, and role are required.');
  }

  if (!VALID_ROLES.includes(newRole as (typeof VALID_ROLES)[number])) {
    throw new ServiceError(
      400,
      `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
    );
  }

  const requesterRole = await clubRepo.getUserRoleInClub(requesterId, clubId);
  if (requesterRole !== 'president') {
    throw new ServiceError(403, 'Only the president can change member roles.');
  }

  if (targetUserId === requesterId && newRole !== 'president') {
    throw new ServiceError(
      400,
      'You cannot demote yourself. Transfer presidency first.',
    );
  }

  const targetInClub = await clubRepo.isUserInClub(targetUserId, clubId);
  if (!targetInClub) {
    throw new ServiceError(404, 'User is not a member of this club.');
  }

  const previousRole = await clubRepo.getUserRoleInClub(targetUserId, clubId);

  // Promoting to president is a transfer: demote every existing president in the
  // club first so the single-president partial unique index is never violated.
  if (newRole === 'president') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await clubRepo.demoteOtherPresidents(client, clubId, targetUserId);
      const updated = await clubRepo.updateMemberRoleTx(
        client,
        clubId,
        targetUserId,
        newRole,
      );
      if (!updated) {
        throw new ServiceError(500, 'Failed to update role.');
      }
      await client.query('COMMIT');
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (e) {
        console.error('Rollback failed:', e);
      }
      throw error instanceof Error
        ? error
        : new Error('Unknown error occurred.');
    } finally {
      client.release();
    }

    await emitRoleChangedNotification({
      targetUserId,
      clubId,
      newRole,
      previousRole,
      requesterId,
    });
    return;
  }

  const updated = await clubRepo.updateMemberRole(
    clubId,
    targetUserId,
    newRole,
  );
  if (!updated) throw new ServiceError(500, 'Failed to update role.');

  await emitRoleChangedNotification({
    targetUserId,
    clubId,
    newRole,
    previousRole,
    requesterId,
  });
}

async function emitRoleChangedNotification(args: {
  targetUserId: string;
  clubId: string;
  newRole: string;
  previousRole: string | null;
  requesterId: string;
}) {
  if (args.targetUserId === args.requesterId) return;
  try {
    const [club, sender] = await Promise.all([
      clubRepo.getClubById(args.clubId),
      userRepo.findById(args.requesterId),
    ]);
    if (!club) return;
    await notificationService.emitRoleChanged({
      targetUserId: args.targetUserId,
      clubId: args.clubId,
      clubName: club.name,
      oldRole: args.previousRole,
      newRole: args.newRole,
      senderId: args.requesterId,
      senderName: sender?.name ?? 'A club admin',
    });
  } catch (err) {
    console.error('[notifications] role_changed wiring failed', err);
  }
}

// Invitations -----------------------------------------------------------

const MAX_INVITES_PER_REQUEST = 50;

export type InviteSkipReason =
  | 'self'
  | 'not_found'
  | 'already_member'
  | 'already_pending';

export interface InviteUsersResult {
  invited: string[];
  skipped: { user_id: string; reason: InviteSkipReason }[];
}

/**
 * Send a `club_invite` notification to each of the supplied users.
 *
 * Idempotent and silent-skipping by design: users who don't exist, are
 * already in the club, are the inviter themselves, or already have an
 * unread invite for this club are dropped from the work set with a
 * `reason` so the caller can surface a friendly summary.
 *
 * Caller authorisation (president/VP) is expected to be enforced by
 * `requireClubRole` middleware on the route — this service trusts the
 * `inviterId` and only validates membership consistency.
 */
export async function inviteUsersToClub(args: {
  clubId: string;
  targetUserIds: string[];
  inviterId: string;
}): Promise<InviteUsersResult> {
  const { clubId, inviterId } = args;

  if (!clubId) throw new ServiceError(400, 'Club ID is required.');
  if (!Array.isArray(args.targetUserIds) || args.targetUserIds.length === 0) {
    throw new ServiceError(400, 'At least one user_id is required.');
  }

  const cleaned = Array.from(
    new Set(
      args.targetUserIds
        .filter((id): id is string => typeof id === 'string')
        .map((id) => id.trim())
        .filter((id) => id.length > 0),
    ),
  );

  if (cleaned.length === 0) {
    throw new ServiceError(400, 'At least one user_id is required.');
  }

  if (cleaned.length > MAX_INVITES_PER_REQUEST) {
    throw new ServiceError(
      400,
      `Cannot invite more than ${MAX_INVITES_PER_REQUEST} users at once.`,
    );
  }

  const club = await clubRepo.getClubById(clubId);
  if (!club) {
    throw new ServiceError(404, 'Club not found.');
  }

  const skipped: { user_id: string; reason: InviteSkipReason }[] = [];
  const candidatePool: string[] = [];

  for (const userId of cleaned) {
    if (userId === inviterId) {
      skipped.push({ user_id: userId, reason: 'self' });
    } else {
      candidatePool.push(userId);
    }
  }

  // Drop users that don't exist.
  const existing = await Promise.all(
    candidatePool.map((id) => userRepo.findById(id)),
  );
  const existingSet = new Set<string>();
  candidatePool.forEach((id, idx) => {
    if (existing[idx]) {
      existingSet.add(id);
    } else {
      skipped.push({ user_id: id, reason: 'not_found' });
    }
  });

  // Drop users that are already in the club.
  const memberIds = new Set(await notificationRepo.getClubMemberIds(clubId));
  const afterMembershipFilter: string[] = [];
  for (const id of existingSet) {
    if (memberIds.has(id)) {
      skipped.push({ user_id: id, reason: 'already_member' });
    } else {
      afterMembershipFilter.push(id);
    }
  }

  // Drop users with an unread club_invite for this club already.
  const pending = new Set(
    await notificationRepo.findUsersWithPendingClubInvite(
      clubId,
      afterMembershipFilter,
    ),
  );
  const toInvite: string[] = [];
  for (const id of afterMembershipFilter) {
    if (pending.has(id)) {
      skipped.push({ user_id: id, reason: 'already_pending' });
    } else {
      toInvite.push(id);
    }
  }

  if (toInvite.length === 0) {
    return { invited: [], skipped };
  }

  const inviter = await userRepo.findById(inviterId);
  const inviterName = inviter?.name ?? 'A club admin';
  const joinCode = (club as Club & { join_code?: string | null }).join_code ?? null;

  for (const userId of toInvite) {
    await notificationService.emitClubInvite({
      userId,
      clubId,
      clubName: club.name,
      senderId: inviterId,
      senderName: inviterName,
      joinCode,
    });
  }

  return { invited: toInvite, skipped };
}

// -----------------------------------------------------------------------

export async function removeMember(
  clubId: string,
  targetUserId: string,
  requesterId: string,
) {
  if (!clubId || !targetUserId) {
    throw new ServiceError(400, 'Club ID and user ID are required.');
  }

  const requesterRole = await clubRepo.getUserRoleInClub(requesterId, clubId);
  if (requesterRole !== 'president') {
    throw new ServiceError(403, 'Only the president can remove members.');
  }

  if (targetUserId === requesterId) {
    throw new ServiceError(
      400,
      'You cannot remove yourself. Use leave club instead.',
    );
  }

  const targetInClub = await clubRepo.isUserInClub(targetUserId, clubId);
  if (!targetInClub) {
    throw new ServiceError(404, 'User is not a member of this club.');
  }

  const removed = await clubRepo.removeMember(clubId, targetUserId);
  if (!removed) throw new ServiceError(500, 'Failed to remove member.');
}

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
