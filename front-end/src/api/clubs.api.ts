import type { Club } from '../types/clubs.types';

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