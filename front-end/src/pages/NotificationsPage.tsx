import { useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  CheckSquare,
  Check,
  PartyPopper,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchClubById, joinClubByCode } from '../api/clubs.api';
import { useNotificationsContext } from '../context/NotificationsContext';
import type { AppNotification } from '../types/notifications.types';
import './NotificationsPage.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'club_invite', label: 'Invites' },
  { id: 'task_assigned', label: 'Tasks' },
  { id: 'event_reminder', label: 'Reminders' },
  { id: 'role_changed', label: 'Roles' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

function getMetaString(
  n: AppNotification,
  key: string,
): string | null {
  const v = n.metadata?.[key as keyof NonNullable<AppNotification['metadata']>];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function formatRelativeTime(iso: string): string {
  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) return '';

  const diffMs = Date.now() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'JUST NOW';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} MIN${diffMin === 1 ? '' : 'S'} AGO`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} HOUR${diffHr === 1 ? '' : 'S'} AGO`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} DAY${diffDay === 1 ? '' : 'S'} AGO`;

  return created.toLocaleDateString().toUpperCase();
}

function humanRole(role?: string | null): string {
  if (!role) return 'a new role';
  switch (role) {
    case 'president':
      return 'President';
    case 'vice_president':
      return 'Vice President';
    case 'member':
      return 'Member';
    default:
      return role.replace(/_/g, ' ');
  }
}

function formatEventDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Welcome notifications (emitClubJoined) currently re-use the
 * `club_invite` type for legacy reasons. We ideally identify them via
 * `metadata.welcome === true`, but rows inserted before that flag
 * existed need a fallback. The backend always emits welcome rows with a
 * title of `Welcome to <club>` and never stamps a `join_code` on them,
 * so the combination is a reliable signal that we should NOT show
 * Accept/Decline buttons on the row.
 */
function isWelcomeNotification(n: AppNotification): boolean {
  if (n.type !== 'club_invite') return false;
  if (n.metadata?.welcome === true) return true;
  const titleLooksLikeWelcome =
    typeof n.title === 'string' && n.title.startsWith('Welcome to ');
  const hasNoJoinCode = !n.metadata?.join_code;
  return titleLooksLikeWelcome && hasNoJoinCode;
}

function getTitleForNotification(n: AppNotification): string {
  if (isWelcomeNotification(n)) {
    return 'Joined Club';
  }
  switch (n.type) {
    case 'club_invite':
      return 'Club Invitation';
    case 'task_assigned':
      return 'Task Assignment';
    case 'event_reminder':
      return 'Event Reminder';
    case 'role_changed':
      return 'Role Updated';
    case 'event_update':
      return 'Event Updated';
    default:
      return 'Notification';
  }
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markRead,
    markAllRead,
    dismiss,
  } = useNotificationsContext();
  const { token } = useAuth();
  const [filter, setFilter] = useState<FilterId>('all');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [filter, notifications]);

  const emptyLabel =
    filter === 'all' ? 'notifications' : FILTERS.find((f) => f.id === filter)?.label.toLowerCase() ?? 'notifications';

  const handleAcceptInvite = async (n: AppNotification) => {
    setActionError(null);
    if (!token) {
      setActionError('You must be signed in to accept invites.');
      return;
    }

    try {
      setAcceptingId(n.notification_id);

      // Prefer the join code stamped into metadata at notification creation.
      // Older invites (created before that field was always populated) only
      // carry a club_id, so fall back to fetching the club to recover the
      // current join code. As a last resort the legacy denormalized
      // n.club_id column is honored too.
      let joinCode = (n.metadata?.join_code as string | undefined) ?? undefined;
      if (!joinCode) {
        const clubId =
          (n.metadata?.club_id as string | undefined) ?? n.club_id ?? null;
        if (clubId) {
          try {
            const club = await fetchClubById(clubId);
            if (club?.join_code) joinCode = club.join_code;
          } catch (lookupErr) {
            console.warn(
              '[notifications] failed to recover join_code for club_invite',
              lookupErr,
            );
          }
        }
      }

      if (!joinCode) {
        setActionError(
          "This invite is missing a join code. Ask the club admin to resend it.",
        );
        return;
      }

      await joinClubByCode(joinCode, token);
      // Once accepted, drop the notification from the list entirely so the
      // Accept/Decline buttons don't linger after the action completes.
      await dismiss(n.notification_id);
      await refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to accept invite';
      if (/already/i.test(message)) {
        await dismiss(n.notification_id);
      } else {
        setActionError(message);
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const renderIcon = (n: AppNotification) => {
    if (isWelcomeNotification(n)) {
      return (
        <div className="notif-page-icon notif-page-icon--welcome">
          <PartyPopper size={24} />
        </div>
      );
    }
    switch (n.type) {
      case 'club_invite':
        return (
          <div className="notif-page-icon notif-page-icon--invite">
            <UserPlus size={24} />
          </div>
        );
      case 'task_assigned':
        return (
          <div className="notif-page-icon notif-page-icon--task">
            <CheckSquare size={24} />
          </div>
        );
      case 'event_reminder':
        return (
          <div className="notif-page-icon notif-page-icon--reminder">
            <Calendar size={24} />
          </div>
        );
      case 'role_changed':
        return (
          <div className="notif-page-icon notif-page-icon--role">
            <ShieldCheck size={24} />
          </div>
        );
      case 'event_update':
        return (
          <div className="notif-page-icon notif-page-icon--reminder">
            <Calendar size={24} />
          </div>
        );
      default:
        return (
          <div className="notif-page-icon notif-page-icon--default">
            <Bell size={24} />
          </div>
        );
    }
  };

  const renderBody = (n: AppNotification) => {
    const senderName = getMetaString(n, 'sender_name') ?? n.sender_name ?? null;
    const clubName = getMetaString(n, 'club_name') ?? n.club_name ?? null;
    const eventName = getMetaString(n, 'event_name') ?? n.event_name ?? null;
    const taskTitle = getMetaString(n, 'task_title') ?? n.title;
    const newRole = humanRole(n.metadata?.new_role as string | undefined);
    const eventTime = formatEventDate(
      n.metadata?.event_date as string | undefined,
    );

    switch (n.type) {
      case 'club_invite':
        if (isWelcomeNotification(n)) {
          return (
            <>
              You joined{' '}
              <span className="notif-page-strong">{clubName ?? 'a club'}</span>. Say hi to your new club!
            </>
          );
        }
        return (
          <>
            {senderName ? (
              <>
                <span className="notif-page-strong">{senderName}</span> has invited you to join the{' '}
              </>
            ) : (
              'You have been invited to join '
            )}
            <span className="notif-page-strong">{clubName ?? 'a club'}</span> committee.
          </>
        );
      case 'task_assigned':
        return (
          <>
            You have been assigned to: <span className="notif-page-strong">"{taskTitle}"</span>
            {eventName ? (
              <>
                {' '}in <span className="notif-page-italic">{eventName}</span>
              </>
            ) : null}
            .
          </>
        );
      case 'event_reminder':
        return (
          <>
            {eventTime ? (
              <>
                <span className="notif-page-strong">{eventName ?? n.title}</span> starts {eventTime}.
              </>
            ) : (
              n.message ?? n.title
            )}
          </>
        );
      case 'role_changed':
        return (
          <>
            Your role in{' '}
            <span className="notif-page-strong">{clubName ?? 'a club'}</span> has been changed to{' '}
            <span className="notif-page-strong">{newRole}</span>.
          </>
        );
      case 'event_update':
        return (
          <>
            <span className="notif-page-strong">{eventName ?? 'An event'}</span> was updated
            {clubName ? <> in <span className="notif-page-italic">{clubName}</span></> : null}
            .
          </>
        );
      default:
        return n.message ?? n.title;
    }
  };

  return (
    <div className="notif-page">
      <div className="notif-page-header">
        <div>
          <h1 className="notif-page-title">Notifications</h1>
          <p className="notif-page-subtitle">
            Stay updated on your club activities and task assignments.
          </p>
        </div>
        <button
          type="button"
          className="notif-page-mark-all"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
        >
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="notif-page-tabs">
        {FILTERS.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`notif-page-tab ${isActive ? 'notif-page-tab--active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <div className="notif-page-banner notif-page-banner--error">{error}</div>}
      {actionError && (
        <div className="notif-page-banner notif-page-banner--error">{actionError}</div>
      )}

      <div className="notif-page-list">
        {isLoading && filtered.length === 0 ? (
          <div className="notif-page-empty">
            <Bell size={48} />
            <p>Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-page-empty">
            <Bell size={48} />
            <p>No {emptyLabel} to show right now.</p>
          </div>
        ) : (
          filtered.map((n) => {
            const isAccepting = acceptingId === n.notification_id;
            // Welcome rows (emitClubJoined) share the `club_invite` type but
            // are NOT actionable — the user has already joined. Treat them as
            // ordinary read-only notifications. We use the helper so legacy
            // rows (without metadata.welcome) are still recognised by their
            // "Welcome to ..." title.
            const isWelcome = isWelcomeNotification(n);
            // Accept stays enabled as long as we have *something* to resolve a
            // join code from — direct metadata.join_code, a club_id in metadata,
            // or the legacy denormalized n.club_id column. The actual recovery
            // happens in handleAcceptInvite.
            const hasJoinTarget =
              n.type === 'club_invite' &&
              !isWelcome &&
              (Boolean(n.metadata?.join_code) ||
                Boolean(n.metadata?.club_id) ||
                Boolean(n.club_id));

            return (
              <div
                key={n.notification_id}
                onClick={() => {
                  // Club invites that still have an actionable Accept button
                  // shouldn't auto-consume the unread state on a stray click.
                  // Welcome rows and every other type are fine to mark read
                  // straight away.
                  const isActionableInvite =
                    n.type === 'club_invite' && !isWelcome;
                  if (!n.read && !isActionableInvite) {
                    markRead(n.notification_id);
                  }
                }}
                className={`notif-page-item ${n.read ? 'notif-page-item--read' : 'notif-page-item--unread'}`}
              >
                <div className="notif-page-item-icon-wrap">{renderIcon(n)}</div>

                <div className="notif-page-item-body">
                  <div className="notif-page-item-head">
                    <h3
                      className={`notif-page-item-title ${
                        n.read ? 'notif-page-item-title--read' : ''
                      }`}
                    >
                      {getTitleForNotification(n)}
                    </h3>
                    <span className="notif-page-item-time">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>

                  <div className="notif-page-item-text">{renderBody(n)}</div>

                  {n.type === 'club_invite' && !isWelcome && (
                    <div className="notif-page-item-actions">
                      <button
                        type="button"
                        className="notif-page-btn notif-page-btn--accept"
                        disabled={isAccepting || !hasJoinTarget}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvite(n);
                        }}
                      >
                        {isAccepting ? 'Accepting...' : 'Accept Invitation'}
                      </button>
                      <button
                        type="button"
                        className="notif-page-btn notif-page-btn--decline"
                        disabled={isAccepting}
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss(n.notification_id);
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {!n.read && <div className="notif-page-item-dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
