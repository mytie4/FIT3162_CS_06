import type {
  Club,
  ClubMember,
  ClubRole,
  UpdateClub,
} from '../types/clubs.types';
import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

const VALID_CLUB_ROLES: ClubRole[] = ['president', 'vice_president', 'member'];

function toClubRole(value: unknown): ClubRole | null {
  if (
    typeof value === 'string' &&
    (VALID_CLUB_ROLES as string[]).includes(value)
  ) {
    return value as ClubRole;
  }
  return null;
}

export async function getAllClubs(token: string): Promise<Club[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonSafe<Club[]>(res, 'Failed to fetch clubs');
}

//Create club based on data from front-end
export async function createClub(
  data: {
    name: string;
    description?: string;
    shared_drive_link?: string;
    type: string;
  },
  token: string,
): Promise<Club> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await parseJsonSafe<{ club?: Club }>(res, 'Failed to create club');

  if (!json || !json.club) {
    throw new Error('Server did not return a club object');
  }

  return json.club;
}

export async function joinClubByCode(
  joinCode: string,
  token: string,
): Promise<{ message?: string; club?: Club }> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ joinCode }),
  });

  return parseJsonSafe<{ message?: string; club?: Club }>(
    res,
    'Failed to join club',
  );
}

export async function leaveClub(clubID: string, token: string) {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ clubID }),
  });

  return parseJsonSafe<{ message?: string }>(res, 'Failed to leave club');
}

export async function fetchClubById(clubId: string): Promise<Club> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/${clubId}`);
  return parseJsonSafe<Club>(res, 'Failed to fetch club');
}

export async function fetchClubMembers(clubId: string): Promise<ClubMember[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/${clubId}/members`);
  return parseJsonSafe<ClubMember[]>(res, 'Failed to fetch members');
}

export async function fetchMyRole(
  clubId: string,
  token: string,
): Promise<ClubRole | null> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/${clubId}/my-role`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // If 401, user might not be logged in — return null instead of throwing.
  if (res.status === 401) return null;

  const data = await parseJsonSafe<{ role?: unknown } | null>(
    res,
    'Failed to fetch role',
  );

  return toClubRole(data?.role);
}

export async function getUserRoleInClub(
  clubId: string,
  token: string,
): Promise<ClubRole | null> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/${clubId}/my-role`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonSafe<ClubRole | null>(res, 'Failed to fetch role');
}

export async function updateClub(
  clubId: string,
  dto: UpdateClub,
  token: string,
): Promise<Club> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/${clubId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  return parseJsonSafe<Club>(res, 'Failed to update club');
}

export async function deleteClub(clubId: string, token: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/${clubId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseJsonSafe<null>(res, 'Failed to delete club');
}

export async function updateMemberRole(
  clubId: string,
  userId: string,
  role: ClubRole,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/clubs/${clubId}/members/${userId}/role`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    },
  );

  await parseJsonSafe<{ message?: string }>(res, 'Failed to update role');
}

export async function removeMember(
  clubId: string,
  userId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/clubs/${clubId}/members/${userId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  await parseJsonSafe<{ message?: string }>(res, 'Failed to remove member');
}

export type InviteSkipReason =
  | 'self'
  | 'not_found'
  | 'already_member'
  | 'already_pending';

export interface SendClubInvitationsResponse {
  message?: string;
  invited: string[];
  skipped: { user_id: string; reason: InviteSkipReason }[];
}

export async function sendClubInvitations(
  clubId: string,
  userIds: string[],
  token: string,
): Promise<SendClubInvitationsResponse> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/clubs/${clubId}/invitations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_ids: userIds }),
    },
  );

  return parseJsonSafe<SendClubInvitationsResponse>(
    res,
    'Failed to send invitations',
  );
}
