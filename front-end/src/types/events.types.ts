export interface Event {
  event_id: string;
  club_id: string;
  title: string;
  type: string | null;
  date: string | null;
  end_date: string | null;
  location: string | null;
  budget: number | null;
  status:
    | "draft"
    | "published"
    | "in_progress"
    | "ongoing"
    | "completed"
    | "cancelled";
  money_used: number | null;
  description: string | null;
  banner_url: string | null;
  created_by: string | null;
  created_at: string | null;
}

export interface CreateEvent {
  club_id: string;
  title: string;
  type?: string | null;
  date?: string | null;
  end_date?: string | null;
  location?: string | null;
  budget?: number | null;
  status?: Event["status"];
  money_used?: number | null;
  description?: string | null;
  banner_url?: string | null;
}

export interface UpdateEvent {
  title?: string;
  type?: string | null;
  date?: string | null;
  end_date?: string | null;
  location?: string | null;
  budget?: number | null;
  status?: Event["status"];
  money_used?: number | null;
  description?: string | null;
  banner_url?: string | null;
}
