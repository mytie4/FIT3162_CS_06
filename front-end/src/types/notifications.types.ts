export type NotificationType =
  | 'club_invite'
  | 'task_assigned'
  | 'event_reminder'
  | 'role_changed'
  | 'event_update';

export type NotificationMetadata = {
  // Common
  club_id?: string;
  event_id?: string;
  task_id?: string;
  sender_id?: string;
  // club_invite
  join_code?: string;
  /** Set to `true` on the welcome notification fired after a successful
   *  join (emitted by `emitClubJoined`). Used to suppress the
   *  Accept/Decline buttons and render different copy. */
  welcome?: boolean;
  // role_changed
  old_role?: string | null;
  new_role?: string;
  // event_reminder
  event_date?: string;
  // event_update
  change_summary?: string;
  // Allow forward-compatible extras
  [key: string]: unknown;
};

export interface AppNotification {
  notification_id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string | null;
  metadata: NotificationMetadata;
  read: boolean;
  created_at: string;
  // Legacy denormalized columns retained by the backend for older rows
  sender_name?: string | null;
  club_name?: string | null;
  event_name?: string | null;
  club_id?: string | null;
  event_id?: string | null;
}

export interface ListNotificationsResponse {
  notifications: AppNotification[];
}

export interface UnreadCountResponse {
  count: number;
}
