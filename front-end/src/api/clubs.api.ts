import type {
  Club,
  ClubMember,
  ClubRole,
  UpdateClub,
} from '../types/clubs.types';

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

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export async function getAllClubs(token: string): Promise<Club[]> {
  const res = await fetch(`${API_BASE}/api/clubs`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: Club[] | { error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? 'Failed to fetch clubs',
    );
  }

  return data as Club[];
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
  const res = await fetch(`${API_BASE}/api/clubs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json: { club?: Club; error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? 'Failed to create club');
  }

  return json.club!;
}

export async function fetchClubById(clubId: string): Promise<Club> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to fetch club');
  }

  return data as Club;
}

export async function fetchClubMembers(clubId: string): Promise<ClubMember[]> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/members`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to fetch members');
  }

  return data as ClubMember[];
}

export async function fetchMyRole(
  clubId: string,
  token: string,
): Promise<ClubRole | null> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/my-role`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    // If 401, user might not be logged in — return null
    if (res.status === 401) return null;
    throw new Error(data.error ?? 'Failed to fetch role');
  }

  return toClubRole(data.role);
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? 'Request failed');
  }
  return data as T;
}

export async function getUserRoleInClub(
  clubId: string,
  token: string,
): Promise<ClubRole | null> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/my-role`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJson<ClubRole | null>(res);
}

export async function updateClub(
  clubId: string,
  dto: UpdateClub,
  token: string,
): Promise<Club> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  return parseJson<Club>(res);
}

export async function deleteClub(clubId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error ?? 'Failed to delete club');
  }
}
