export interface Club {
  club_id: string;
  name: string;
  description: string | null;
  shared_drive_link: string | null;
  club_color: string | null;
  ongoing_event_count: number;
  member_count: number;
}
