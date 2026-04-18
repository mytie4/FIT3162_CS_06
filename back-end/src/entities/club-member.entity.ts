export interface ClubMember {
  club_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export type ClubRole = 'president' | 'vice_president' | 'member';

export interface AddClubMemberDTO {
  user_id: string;
  role: ClubRole;
}

export interface UpdateMemberRoleDTO {
  role: ClubRole;
}
