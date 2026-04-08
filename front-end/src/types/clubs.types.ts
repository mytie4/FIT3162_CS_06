export interface Club {
  club_id: number;
  name: string;
  description: string | null;
  shared_drive_link: string | null;
  // ****for extra features****
  category: string;
  ongoingEvent: number;
  memberCount: number;
}
