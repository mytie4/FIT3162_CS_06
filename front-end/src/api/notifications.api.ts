import type {
  AppNotification,
  ListNotificationsResponse,
  UnreadCountResponse,
} from '../types/notifications.types';
import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

export interface ListNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchNotifications(
  token: string,
  options: ListNotificationsOptions = {},
): Promise<AppNotification[]> {
  const params = new URLSearchParams();
  if (options.unreadOnly) params.set('unread', 'true');
  if (typeof options.limit === 'number') params.set('limit', String(options.limit));
  if (typeof options.offset === 'number') params.set('offset', String(options.offset));

  const qs = params.toString();
  const url = `${API_BASE}/api/notifications${qs ? `?${qs}` : ''}`;

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await parseJsonSafe<ListNotificationsResponse>(
    res,
    'Failed to fetch notifications',
  );
  return json?.notifications ?? [];
}

export async function fetchUnreadCount(token: string): Promise<number> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/notifications/unread-count`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const json = await parseJsonSafe<UnreadCountResponse>(
    res,
    'Failed to fetch unread count',
  );
  return typeof json?.count === 'number' ? json.count : 0;
}

export async function markNotificationRead(
  notificationId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  await parseJsonSafe<{ message?: string }>(
    res,
    'Failed to mark notification as read',
  );
}

export async function markAllNotificationsRead(token: string): Promise<number> {
  const res = await fetchWithTimeout(`${API_BASE}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await parseJsonSafe<{ updated?: number }>(
    res,
    'Failed to mark notifications as read',
  );
  return typeof json?.updated === 'number' ? json.updated : 0;
}

export async function deleteNotification(
  notificationId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/notifications/${notificationId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  await parseJsonSafe<null>(res, 'Failed to delete notification');
}
