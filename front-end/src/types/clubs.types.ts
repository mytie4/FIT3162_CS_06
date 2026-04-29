export type ClubRole = "president" | "vice_president" | "member";

export interface Club {
  club_id: string;
  name: string;
  description: string | null;
  shared_drive_link: string | null;
  club_color: string | null;
  type?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  discord_link?: string | null;
  instagram_link?: string | null;
  website_link?: string | null;
  join_code?: string | null;
  ongoing_event_count: number;
  member_count: number;
}

export interface ClubMember {
  user_id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: ClubRole;
  joined_at: string | null;
}

export interface UpdateClub {
  name?: string;
  description?: string | null;
  shared_drive_link?: string | null;
  club_color?: string | null;
  type?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  discord_link?: string | null;
  instagram_link?: string | null;
  website_link?: string | null;
}
