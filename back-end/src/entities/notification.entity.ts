export type NotificationType =
  | 'club_invite'
  | 'task_assigned'
  | 'event_reminder'
  | 'role_changed'
  | 'event_update';

export type NotificationMetadata = Record<string, unknown>;

export interface Notification {
  notification_id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string | null;
  metadata: NotificationMetadata;
  read: boolean;
  created_at: string;
  // Legacy denormalized columns kept by older migrations. They are exposed so
  // the API can still surface them on rows that were inserted before the
  // metadata column existed.
  sender_name: string | null;
  club_name: string | null;
  event_name: string | null;
  club_id: string | null;
  event_id: string | null;
}

export interface CreateNotificationDTO {
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  metadata?: NotificationMetadata;
  club_id?: string | null;
  event_id?: string | null;
  sender_name?: string | null;
  club_name?: string | null;
  event_name?: string | null;
}

export interface ListNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
