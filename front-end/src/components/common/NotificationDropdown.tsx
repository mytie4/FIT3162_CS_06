import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CheckSquare,
  PartyPopper,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import type { AppNotification } from '../../types/notifications.types';
import { useAuth } from '../../context/AuthContext';
import { joinClubByCode } from '../../api/clubs.api';
import './NotificationDropdown.css';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkRead: (id: string) => void | Promise<void>;
  onMarkAllRead: () => void | Promise<void>;
  onDismiss: (id: string) => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
}

const ICON_BY_TYPE: Record<
  string,
  { icon: typeof Bell; iconClass: string; label: string }
> = {
  club_invite: {
    icon: UserPlus,
    iconClass: 'notif-icon notif-icon--invite',
    label: 'Club Invitation',
  },
  task_assigned: {
    icon: CheckSquare,
    iconClass: 'notif-icon notif-icon--task',
    label: 'Task Assignment',
  },
  event_reminder: {
    icon: Calendar,
    iconClass: 'notif-icon notif-icon--reminder',
    label: 'Event Reminder',
  },
  role_changed: {
    icon: ShieldCheck,
    iconClass: 'notif-icon notif-icon--role',
    label: 'Role Updated',
  },
  event_update: {
    icon: Calendar,
    iconClass: 'notif-icon notif-icon--reminder',
    label: 'Event Updated',
  },
};

function formatRelativeTime(iso: string): string {
  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) return '';

  const diffMs = Date.now() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

  return created.toLocaleDateString();
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

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void | Promise<void>;
  onDismiss: (id: string) => void | Promise<void>;
  onAcceptInvite: (n: AppNotification) => Promise<void>;
  acceptingId: string | null;
}

function isWelcomeNotification(n: AppNotification): boolean {
  if (n.type !== 'club_invite') return false;
  if (n.metadata?.welcome === true) return true;
  // Fallback for legacy rows that pre-date the `welcome` flag: the
  // backend always titles welcome notifications "Welcome to <club>"
  // and never attaches a join_code to them, so the combination is a
  // reliable signal.
  const titleLooksLikeWelcome =
    typeof n.title === 'string' && n.title.startsWith('Welcome to ');
  return titleLooksLikeWelcome && !n.metadata?.join_code;
}

function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
  onAcceptInvite,
  acceptingId,
}: NotificationItemProps) {
  // Welcome rows (emitClubJoined) ride on the `club_invite` type but are
  // a confirmation, not an invitation. Render them with their own icon
  // and label so the user doesn't see a phantom "Accept" affordance.
  const isWelcome = isWelcomeNotification(notification);
  const meta = isWelcome
    ? {
        icon: PartyPopper,
        iconClass: 'notif-icon notif-icon--welcome',
        label: 'Joined Club',
      }
    : ICON_BY_TYPE[notification.type] ?? {
        icon: Bell,
        iconClass: 'notif-icon notif-icon--default',
        label: notification.title,
      };
  const IconComp = meta.icon;
  const senderName =
    (typeof notification.metadata?.sender_name === 'string'
      ? (notification.metadata.sender_name as string)
      : null) ?? notification.sender_name ?? null;
  const clubName =
    (typeof notification.metadata?.club_name === 'string'
      ? (notification.metadata.club_name as string)
      : null) ?? notification.club_name ?? null;
  const eventName =
    (typeof notification.metadata?.event_name === 'string'
      ? (notification.metadata.event_name as string)
      : null) ?? notification.event_name ?? null;
  const taskTitle =
    (typeof notification.metadata?.task_title === 'string'
      ? (notification.metadata.task_title as string)
      : null) ?? notification.title;
  const newRole = humanRole(notification.metadata?.new_role as string | undefined);
  const eventTime = formatEventDate(
    notification.metadata?.event_date as string | undefined,
  );

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.notification_id);
    }
  };

  const renderBody = () => {
    switch (notification.type) {
      case 'club_invite':
        if (isWelcome) {
          return (
            <p className="notif-body">
              You joined{' '}
              <span className="notif-strong">{clubName ?? 'a club'}</span>.
            </p>
          );
        }
        return (
          <p className="notif-body">
            {senderName ? (
              <>
                <span className="notif-strong">{senderName}</span> invited you to join{' '}
              </>
            ) : (
              'You were invited to join '
            )}
            <span className="notif-strong">{clubName ?? 'a club'}</span>.
          </p>
        );
      case 'task_assigned':
        return (
          <p className="notif-body">
            You were assigned: <span className="notif-strong">{taskTitle}</span>
            {eventName ? (
              <>
                {' '}in <span className="notif-italic">{eventName}</span>
              </>
            ) : null}
            .
          </p>
        );
      case 'event_reminder':
        return (
          <p className="notif-body">
            <span className="notif-strong">{eventName ?? notification.title}</span>{' '}
            {eventTime ? <>starts {eventTime}.</> : 'is starting soon.'}
          </p>
        );
      case 'role_changed':
        return (
          <p className="notif-body">
            Your role in{' '}
            <span className="notif-strong">{clubName ?? 'a club'}</span> changed to{' '}
            <span className="notif-strong">{newRole}</span>.
          </p>
        );
      case 'event_update':
        return (
          <p className="notif-body">
            <span className="notif-strong">{eventName ?? 'An event'}</span> was updated
            {clubName ? <> in <span className="notif-italic">{clubName}</span></> : null}
            .
          </p>
        );
      default:
        return (
          <p className="notif-body">{notification.message ?? notification.title}</p>
        );
    }
  };

  const isInvite = notification.type === 'club_invite' && !isWelcome;
  const hasJoinCode = isInvite && Boolean(notification.metadata?.join_code);
  const isAccepting = acceptingId === notification.notification_id;

  return (
    <li
      className={`notif-item ${notification.read ? '' : 'notif-item--unread'}`}
      onClick={handleClick}
    >
      <div className={meta.iconClass} aria-hidden="true">
        <IconComp size={16} />
      </div>

      <div className="notif-content">
        <div className="notif-header">
          <span className="notif-type-label">{meta.label}</span>
          <span className="notif-time">{formatRelativeTime(notification.created_at)}</span>
        </div>

        {renderBody()}

        {isInvite && !notification.read && (
          <div className="notif-actions">
            <button
              type="button"
              className="notif-btn notif-btn--accept"
              disabled={isAccepting || !hasJoinCode}
              onClick={(e) => {
                e.stopPropagation();
                onAcceptInvite(notification);
              }}
            >
              {isAccepting ? 'Accepting...' : 'Accept'}
            </button>
            <button
              type="button"
              className="notif-btn notif-btn--decline"
              disabled={isAccepting}
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.notification_id);
              }}
            >
              Decline
            </button>
          </div>
        )}
      </div>

      {!notification.read && (
        <span className="notif-unread-dot" aria-label="Unread" />
      )}
    </li>
  );
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  isLoading,
  error,
  isOpen,
  onToggle,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onRefresh,
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Click-outside + ESC closes the dropdown.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleAcceptInvite = async (n: AppNotification) => {
    setAcceptError(null);
    if (!token) {
      setAcceptError('You must be signed in to accept invites.');
      return;
    }
    const joinCode = n.metadata?.join_code as string | undefined;
    if (!joinCode) {
      // No join code on the notification — just mark it read so the badge clears.
      await onMarkRead(n.notification_id);
      return;
    }

    try {
      setAcceptingId(n.notification_id);
      await joinClubByCode(joinCode, token);
      await onMarkRead(n.notification_id);
      await onRefresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to accept invite';
      // If the user is already a member treat it as success.
      if (/already/i.test(message)) {
        await onMarkRead(n.notification_id);
      } else {
        setAcceptError(message);
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  // Show only the most recent 5 in the dropdown.
  const preview = notifications.slice(0, 5);

  return (
    <div className="notif-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`notif-bell ${isOpen ? 'notif-bell--open' : ''}`}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-panel-header">
            <div className="notif-panel-title">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-panel-count">{unreadCount} new</span>
              )}
            </div>
            <div className="notif-panel-tools">
              <button
                type="button"
                className="notif-link-btn"
                onClick={() => onRefresh()}
                aria-label="Refresh notifications"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                className="notif-link-btn notif-link-btn--text"
                onClick={() => onMarkAllRead()}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>

          {error && <div className="notif-banner notif-banner--error">{error}</div>}
          {acceptError && (
            <div className="notif-banner notif-banner--error">{acceptError}</div>
          )}

          <div className="notif-panel-body">
            {isLoading && preview.length === 0 ? (
              <div className="notif-empty">Loading notifications...</div>
            ) : preview.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} />
                <p>You're all caught up.</p>
              </div>
            ) : (
              <ul className="notif-list">
                {preview.map((n) => (
                  <NotificationItem
                    key={n.notification_id}
                    notification={n}
                    onMarkRead={onMarkRead}
                    onDismiss={onDismiss}
                    onAcceptInvite={handleAcceptInvite}
                    acceptingId={acceptingId}
                  />
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className="notif-view-all"
            onClick={handleViewAll}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
