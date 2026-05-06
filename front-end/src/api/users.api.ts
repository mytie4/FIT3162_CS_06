import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

export interface PlatformUser {
  user_id: string;
  name: string;
  email: string;
  profile_pic_url: string | null;
}

interface SearchPlatformUsersOptions {
  /** Optional club whose existing members are excluded from results. */
  excludeClubId?: string;
  /** Optional cap on rows returned. Backend hard-caps at 25. */
  limit?: number;
  /** Optional caller-controlled abort signal (e.g. for debounced searches). */
  signal?: AbortSignal;
}

/**
 * Substring-search the platform's user directory. Backend requires a
 * minimum of 2 characters and always excludes the requesting user.
 */
export async function searchPlatformUsers(
  query: string,
  token: string,
  options: SearchPlatformUsersOptions = {},
): Promise<PlatformUser[]> {
  const params = new URLSearchParams({ q: query });
  if (options.excludeClubId) params.set('clubId', options.excludeClubId);
  if (options.limit !== undefined) params.set('limit', String(options.limit));

  const res = await fetchWithTimeout(
    `${API_BASE}/api/users/search?${params.toString()}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      signal: options.signal,
    },
  );

  const data = await parseJsonSafe<{ users: PlatformUser[] }>(
    res,
    'Failed to search users',
  );
  return data.users;
}
