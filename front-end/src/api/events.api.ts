import type { Event, CreateEvent, UpdateEvent } from '../types/events.types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? 'Request failed');
  }
  return data as T;
}

export async function fetchAllEvents(token: string): Promise<Event[]> {
  const res = await fetch(`${API_BASE}/api/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJson<Event[]>(res);
}

export async function fetchEventById(eventId: string): Promise<Event> {
  const res = await fetch(`${API_BASE}/api/events/${eventId}`);
  return parseJson<Event>(res);
}

export async function fetchClubEvents(clubId: string): Promise<Event[]> {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/events`);
  return parseJson<Event[]>(res);
}

export async function createEvent(
  dto: CreateEvent,
  token: string,
): Promise<Event> {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  return parseJson<Event>(res);
}

export async function updateEvent(
  eventId: string,
  dto: UpdateEvent,
  token: string,
): Promise<Event> {
  const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  return parseJson<Event>(res);
}

export async function deleteEvent(
  eventId: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error ?? 'Failed to delete event');
  }
}
