import * as userRepo from '../repositories/user.repository';
import type { UserSearchResult } from '../repositories/user.repository';

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export interface SearchPlatformUsersInput {
  query: string;
  /** Caller's user_id; never returned in results. */
  requesterId: string;
  /** Optional club to exclude existing members from the results. */
  excludeClubId?: string;
  /** Optional limit (1-25); falls back to a sensible default. */
  limit?: number;
}

/**
 * Free-text search across the platform's user directory. Used by the
 * "Invite Members" picker. The query must be at least
 * {@link MIN_QUERY_LENGTH} characters; anything shorter is rejected with
 * 400 to avoid scanning the whole table on a single keystroke.
 */
export async function searchPlatformUsers(
  input: SearchPlatformUsersInput,
): Promise<UserSearchResult[]> {
  const trimmed = input.query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) {
    throw new ServiceError(
      400,
      `Search query must be at least ${MIN_QUERY_LENGTH} characters`,
    );
  }

  const limit = clampLimit(input.limit);

  return userRepo.searchUsers(trimmed, {
    excludeUserId: input.requesterId,
    excludeClubId: input.excludeClubId,
    limit,
  });
}

function clampLimit(raw: number | undefined): number {
  if (raw === undefined || Number.isNaN(raw)) return DEFAULT_LIMIT;
  if (raw < 1) return 1;
  if (raw > MAX_LIMIT) return MAX_LIMIT;
  return Math.floor(raw);
}
