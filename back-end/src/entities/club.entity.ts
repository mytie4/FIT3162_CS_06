export interface Club {
  club_id: string;
  name: string;
  description: string | null;
  shared_drive_link: string | null;
}

export interface CreateClubDTO {
  name: string;
  description?: string;
  shared_drive_link?: string;
}

export interface UpdateClubDTO {
  name?: string;
  description?: string;
  shared_drive_link?: string;
}
