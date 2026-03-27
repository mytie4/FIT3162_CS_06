export interface ClubMember {
  club_id: number;
  user_id: number;
  role: string;
}

export type ClubRole = 'president' | 'vice_president' | 'member';

export interface AddClubMemberDTO {
  user_id: number;
  role: ClubRole;
}

export interface UpdateMemberRoleDTO {
  role: ClubRole;
}
