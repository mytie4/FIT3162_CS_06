import type { Club } from "../types/clubs.types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function getAllClubs(): Promise<Club[]> {
  const res = await fetch(`${API_BASE}/api/clubs`, {
    method: "GET",
  });

  const data: Club[] | { error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? "Failed to fetch clubs",
    );
  }

  return data as Club[];
}
