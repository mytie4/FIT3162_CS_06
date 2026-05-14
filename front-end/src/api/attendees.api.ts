import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

export interface Attendee {
  event_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_avatar: string | null;
  club_role: 'president' | 'vice_president' | 'member' | null;
  registered_at: string;
}

export async function listAttendees(
  eventId: string,
  token: string,
): Promise<Attendee[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/attendees`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return parseJsonSafe<Attendee[]>(res, 'Failed to load attendees');
}

export async function addAttendee(
  eventId: string,
  userId: string,
  token: string,
): Promise<Attendee> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/attendees`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    },
  );
  const envelope = await parseJsonSafe<{ message?: string; attendee: Attendee }>(
    res,
    'Failed to add attendee',
  );
  return envelope.attendee;
}

export async function removeAttendee(
  eventId: string,
  userId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/attendees/${userId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error('Failed to remove attendee');
}
