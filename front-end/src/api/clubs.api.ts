import type { Club, ClubMember } from '../types/clubs.types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export async function getAllClubs(): Promise<Club[]> {
  const res = await fetch(`${API_BASE}/api/clubs`, {
    method: 'GET',
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
  data: { name: string; description?: string; shared_drive_link?: string },
  token: string,
): Promise<Club> {
  const res = await fetch(`${API_BASE}/api/clubs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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

export async function fetchMyRole(clubId: string, token: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/my-role`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    // If 401, user might not be logged in — return null
    if (res.status === 401) return null;
    throw new Error(data.error ?? 'Failed to fetch role');
  }

  return data.role ?? null;
}