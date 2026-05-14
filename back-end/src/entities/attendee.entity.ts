// Backed by the existing "Event_Attendees" table (migration 1775900000000).
// The natural key is (event_id, user_id) — there is no synthetic attendee_id
// column. `rsvp_status` defaults to 'going' in the DB; the officer-managed
// roster always treats present rows as "going" and does not expose the field.

export interface Attendee {
  event_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_avatar: string | null;
  club_role: 'president' | 'vice_president' | 'member' | null;
  registered_at: string;
}

export interface CreateAttendeeDTO {
  user_id: string;
}
