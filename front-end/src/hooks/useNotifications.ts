import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteNotification as apiDeleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications.api';
import type { AppNotification } from '../types/notifications.types';
import { useAuth } from '../context/AuthContext';

// Background poll interval. Notifications are not high-frequency so 30s
// keeps the bell roughly in sync without hammering the API.
const POLL_INTERVAL_MS = 30_000;

interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setError(null);
      return;
    }

    try {
      setError(null);
      const list = await fetchNotifications(token, { limit: 50 });
      if (isMountedRef.current) {
        setNotifications(list);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      }
    }
  }, [token]);

  // Initial load + polling. Guarded so we only attach intervals when a
  // token is present; refresh() itself handles the no-token reset path.
  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      if (!token) {
        // refresh() will clear local state through its callback path.
        await refresh();
        return;
      }
      setIsLoading(true);
      await refresh();
      if (!cancelled && isMountedRef.current) {
        setIsLoading(false);
      }
    }

    initialLoad();

    if (!token) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        refresh();
      }
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      refresh();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [token, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      if (!token) return;
      // Optimistic update so the bell badge updates immediately.
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, read: true } : n)),
      );
      try {
        await markNotificationRead(id, token);
      } catch (err) {
        // Roll back on failure.
        await refresh();
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to mark as read');
        }
      }
    },
    [token, refresh],
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead(token);
    } catch (err) {
      await refresh();
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Failed to mark all as read',
        );
      }
    }
  }, [token, refresh]);

  const dismiss = useCallback(
    async (id: string) => {
      if (!token) return;
      const previous = notifications;
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== id),
      );
      try {
        await apiDeleteNotification(id, token);
      } catch (err) {
        if (isMountedRef.current) {
          setNotifications(previous);
          setError(
            err instanceof Error ? err.message : 'Failed to dismiss notification',
          );
        }
      }
    },
    [token, notifications],
  );

  const unreadCount = notifications.reduce(
    (acc, n) => (n.read ? acc : acc + 1),
    0,
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markRead,
    markAllRead,
    dismiss,
  };
}
