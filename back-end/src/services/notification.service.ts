import type { PoolClient } from 'pg';
import * as notificationRepo from '../repositories/notification.repository';
import type {
  ListNotificationsOptions,
  Notification,
  NotificationMetadata,
} from '../entities/notification.entity';
import { ServiceError } from './club.service';

export async function listForUser(
  userId: string,
  options: ListNotificationsOptions = {},
): Promise<Notification[]> {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized.');
  }
  return notificationRepo.listForUser(userId, options);
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized.');
  }
  return notificationRepo.getUnreadCount(userId);
}

export async function markRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized.');
  }
  if (!notificationId) {
    throw new ServiceError(400, 'Notification ID is required.');
  }
  const ok = await notificationRepo.markRead(notificationId, userId);
  if (!ok) {
    throw new ServiceError(404, 'Notification not found.');
  }
}

export async function markAllRead(userId: string): Promise<number> {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized.');
  }
  return notificationRepo.markAllRead(userId);
}

export async function deleteNotification(
  notificationId: string,
  userId: string,
): Promise<void> {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized.');
  }
  if (!notificationId) {
    throw new ServiceError(400, 'Notification ID is required.');
  }
  const ok = await notificationRepo.deleteNotification(notificationId, userId);
  if (!ok) {
    throw new ServiceError(404, 'Notification not found.');
  }
}

// Emitters ---------------------------------------------------------------
//
// Each emitter is best-effort: callers wrap them in try/catch (or the helper
// below) so a notification failure never breaks the primary action.
// Pass `client` to participate in an existing transaction.

export interface TaskAssignedPayload {
  assigneeId: string;
  taskId: string;
  taskTitle: string;
  eventId: string;
  eventTitle: string;
  clubId: string;
  clubName: string;
  senderId: string;
  senderName: string;
}

export async function emitTaskAssigned(
  payload: TaskAssignedPayload,
  client?: PoolClient,
): Promise<void> {
  await safeCreate(
    {
      user_id: payload.assigneeId,
      type: 'task_assigned',
      title: `New task: ${payload.taskTitle}`,
      message: `${payload.senderName} assigned you "${payload.taskTitle}" in ${payload.eventTitle} (${payload.clubName}).`,
      metadata: {
        task_id: payload.taskId,
        event_id: payload.eventId,
        club_id: payload.clubId,
        sender_id: payload.senderId,
      },
      club_id: payload.clubId,
      event_id: payload.eventId,
      sender_name: payload.senderName,
      club_name: payload.clubName,
      event_name: payload.eventTitle,
    },
    client,
  );
}

export interface ClubInvitePayload {
  /** The user who should receive the invite. */
  userId: string;
  clubId: string;
  clubName: string;
  /** Sender (the inviting officer) — surfaces in the message body. */
  senderId?: string | null;
  senderName?: string | null;
  /** Optional join code stamped into metadata so the recipient's
   *  notification dropdown can render a one-click "Join" button. */
  joinCode?: string | null;
}

/**
 * Emits a `club_invite` notification asking the recipient to join a club.
 * Used by the "Invite Members" picker.
 */
export async function emitClubInvite(
  payload: ClubInvitePayload,
  client?: PoolClient,
): Promise<void> {
  const metadata: NotificationMetadata = {
    club_id: payload.clubId,
  };
  if (payload.senderId) metadata.sender_id = payload.senderId;
  if (payload.joinCode) metadata.join_code = payload.joinCode;

  const inviter = payload.senderName?.trim() || 'A club admin';

  await safeCreate(
    {
      user_id: payload.userId,
      type: 'club_invite',
      title: `You're invited to join ${payload.clubName}`,
      message: `${inviter} invited you to ${payload.clubName}. Tap to accept.`,
      metadata,
      club_id: payload.clubId,
      sender_name: payload.senderName ?? null,
      club_name: payload.clubName,
    },
    client,
  );
}

export interface ClubJoinedPayload {
  userId: string;
  clubId: string;
  clubName: string;
}

/**
 * Confirmation notification fired *after* a user successfully joins a
 * club via code. Distinct from {@link emitClubInvite} so the recipient
 * doesn't see a "join" button on their own welcome notification.
 *
 * We stamp `metadata.welcome = true` so the front-end can render this
 * differently from a real invite (no Accept/Decline buttons, "Welcome…"
 * copy instead of "you have been invited…"). Without this flag both
 * rows look identical because they share the `club_invite` type.
 */
export async function emitClubJoined(
  payload: ClubJoinedPayload,
  client?: PoolClient,
): Promise<void> {
  await safeCreate(
    {
      user_id: payload.userId,
      type: 'club_invite',
      title: `Welcome to ${payload.clubName}`,
      message: `You joined ${payload.clubName}. Say hi to your new club!`,
      metadata: {
        club_id: payload.clubId,
        welcome: true,
      },
      club_id: payload.clubId,
      club_name: payload.clubName,
    },
    client,
  );
}

export interface RoleChangedPayload {
  targetUserId: string;
  clubId: string;
  clubName: string;
  oldRole: string | null;
  newRole: string;
  senderId: string;
  senderName: string;
}

export async function emitRoleChanged(
  payload: RoleChangedPayload,
  client?: PoolClient,
): Promise<void> {
  const friendlyRole = humanRole(payload.newRole);
  await safeCreate(
    {
      user_id: payload.targetUserId,
      type: 'role_changed',
      title: `Your role changed to ${friendlyRole}`,
      message: `${payload.senderName} updated your role in ${payload.clubName}${
        payload.oldRole ? ` (was ${humanRole(payload.oldRole)})` : ''
      }.`,
      metadata: {
        club_id: payload.clubId,
        old_role: payload.oldRole,
        new_role: payload.newRole,
        sender_id: payload.senderId,
      },
      club_id: payload.clubId,
      sender_name: payload.senderName,
      club_name: payload.clubName,
    },
    client,
  );
}

export interface EventUpdatePayload {
  recipientUserIds: string[];
  eventId: string;
  eventTitle: string;
  clubId: string;
  clubName: string;
  changeSummary?: string;
  senderId?: string;
  senderName?: string;
}

export async function emitEventUpdate(
  payload: EventUpdatePayload,
  client?: PoolClient,
): Promise<void> {
  if (payload.recipientUserIds.length === 0) return;

  const message = payload.changeSummary
    ? `${payload.eventTitle} was updated: ${payload.changeSummary}.`
    : `${payload.eventTitle} was updated.`;

  await Promise.all(
    payload.recipientUserIds.map((recipientId) =>
      safeCreate(
        {
          user_id: recipientId,
          type: 'event_update',
          title: `Event updated: ${payload.eventTitle}`,
          message,
          metadata: {
            event_id: payload.eventId,
            club_id: payload.clubId,
            sender_id: payload.senderId,
            change_summary: payload.changeSummary,
          },
          club_id: payload.clubId,
          event_id: payload.eventId,
          sender_name: payload.senderName ?? null,
          club_name: payload.clubName,
          event_name: payload.eventTitle,
        },
        client,
      ),
    ),
  );
}

export interface EventReminderPayload {
  recipientUserIds: string[];
  eventId: string;
  eventTitle: string;
  eventDate: string;
  clubId: string;
  clubName: string;
}

export async function emitEventReminder(
  payload: EventReminderPayload,
  client?: PoolClient,
): Promise<void> {
  if (payload.recipientUserIds.length === 0) return;

  const when = new Date(payload.eventDate);
  const whenLabel = isNaN(when.getTime())
    ? 'soon'
    : when.toLocaleString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });

  for (const recipientId of payload.recipientUserIds) {
    await safeCreate(
      {
        user_id: recipientId,
        type: 'event_reminder',
        title: `Reminder: ${payload.eventTitle}`,
        message: `${payload.eventTitle} (${payload.clubName}) starts ${whenLabel}.`,
        metadata: {
          event_id: payload.eventId,
          club_id: payload.clubId,
          event_date: payload.eventDate,
        },
        club_id: payload.clubId,
        event_id: payload.eventId,
        club_name: payload.clubName,
        event_name: payload.eventTitle,
      },
      client,
    );
  }
}

// Scans for events starting in the supplied lookahead window (default
// 23h-25h ahead) and emits one event_reminder per attendee. Idempotent: a
// reminder is only emitted if one does not already exist for the same
// (user_id, event_id) pair.
export async function runEventReminderScan(options: {
  lookaheadHours?: number;
  windowMinutes?: number;
} = {}): Promise<{ scanned: number; emitted: number }> {
  const lookaheadHours = options.lookaheadHours ?? 24;
  const windowMinutes = options.windowMinutes ?? 60;

  const now = Date.now();
  const center = now + lookaheadHours * 60 * 60 * 1000;
  const half = (windowMinutes / 2) * 60 * 1000;
  const start = new Date(center - half);
  const end = new Date(center + half);

  const rows = await notificationRepo.findEventsNeedingReminders(start, end);

  let emitted = 0;
  for (const r of rows) {
    try {
      await notificationRepo.createNotification({
        user_id: r.user_id,
        type: 'event_reminder',
        title: `Reminder: ${r.event_title}`,
        message: `${r.event_title} (${r.club_name}) is starting soon.`,
        metadata: {
          event_id: r.event_id,
          club_id: r.club_id,
          event_date: r.event_date,
        },
        club_id: r.club_id,
        event_id: r.event_id,
        club_name: r.club_name,
        event_name: r.event_title,
      });
      emitted++;
    } catch (err) {
      console.error('[notifications] event reminder emit failed', {
        user_id: r.user_id,
        event_id: r.event_id,
        err,
      });
    }
  }

  return { scanned: rows.length, emitted };
}

// Internal helpers --------------------------------------------------------

async function safeCreate(
  dto: Parameters<typeof notificationRepo.createNotification>[0],
  client?: PoolClient,
): Promise<void> {
  try {
    await notificationRepo.createNotification(dto, client);
  } catch (err) {
    // Never let a notification failure break the caller's primary action.
    // If the caller passed a transactional client, the error here will not
    // poison the parent transaction because we swallow it.
    console.error('[notifications] emit failed', {
      type: dto.type,
      user_id: dto.user_id,
      err,
    });
  }
}

function humanRole(role: string): string {
  switch (role) {
    case 'president':
      return 'President';
    case 'vice_president':
      return 'Vice President';
    case 'member':
      return 'Member';
    default:
      return role;
  }
}
