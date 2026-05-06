import type { Event, CreateEvent, UpdateEvent } from '../types/events.types';
import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

export async function fetchAllEvents(token: string): Promise<Event[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonSafe<Event[]>(res, 'Failed to fetch events');
}

export async function fetchEventById(eventId: string): Promise<Event> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events/${eventId}`);
  return parseJsonSafe<Event>(res, 'Failed to fetch event');
}

export async function fetchClubEvents(clubId: string): Promise<Event[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/clubs/${clubId}/events`);
  return parseJsonSafe<Event[]>(res, 'Failed to fetch club events');
}

export async function createEvent(
  dto: CreateEvent,
  token: string,
): Promise<Event> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  return parseJsonSafe<Event>(res, 'Failed to create event');
}

export async function updateEvent(
  eventId: string,
  dto: UpdateEvent,
  token: string,
): Promise<Event> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  return parseJsonSafe<Event>(res, 'Failed to update event');
}

export async function deleteEvent(
  eventId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseJsonSafe<null>(res, 'Failed to delete event');
}
