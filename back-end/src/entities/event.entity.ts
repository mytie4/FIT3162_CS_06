export interface Event {
  event_id: string;
  club_id: string;
  title: string;
  type: string | null;
  date: string | null;
  end_date: string | null;
  location: string | null;
  description: string | null;
  banner_url: string | null;
  visibility: 'public' | 'members_only';
  budget: number | null;
  // changed in_progress to ongoing
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  money_used: number;
  created_by: string;
  created_at: string;
}

export interface EventWithClubName extends Event {
  club_name: string;
  attendee_count: number;
}

export interface CreateEventDTO {
  club_id: string;
  title: string;
  type?: string;
  date?: string;
  end_date?: string;
  location?: string;
  description?: string;
  banner_url?: string;
  visibility?: 'public' | 'members_only';
  budget?: number;
  status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {}