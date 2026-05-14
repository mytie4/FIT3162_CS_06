import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

export interface TransportPassenger {
  passenger_id: string;
  driver_id: string;
  user_id: string;
  user_name: string | null;
  created_at: string;
}

export interface TransportDriver {
  driver_id: string;
  event_id: string;
  driver_user_id: string | null;
  driver_name: string;
  vehicle: string | null;
  seats_total: number;
  departure_location: string;
  departure_time: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  passengers: TransportPassenger[];
}

export interface CreateTransportDriverInput {
  driver_name: string;
  vehicle?: string;
  seats_total: number;
  departure_location: string;
  departure_time: string;
  notes?: string;
}

export async function listTransportDrivers(
  eventId: string,
  token: string,
): Promise<TransportDriver[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/transport-drivers`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return parseJsonSafe<TransportDriver[]>(res, 'Failed to load transport drivers');
}

export async function createTransportDriver(
  eventId: string,
  dto: CreateTransportDriverInput,
  token: string,
): Promise<TransportDriver> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/transport-drivers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    },
  );
  const envelope = await parseJsonSafe<{ message?: string; driver: TransportDriver }>(
    res,
    'Failed to create driver',
  );
  return envelope.driver;
}

export async function deleteTransportDriver(
  eventId: string,
  driverId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/transport-drivers/${driverId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error('Failed to delete driver');
}

export async function joinTransportDriver(
  eventId: string,
  driverId: string,
  token: string,
): Promise<TransportPassenger> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/transport-drivers/${driverId}/passengers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    },
  );
  const envelope = await parseJsonSafe<{
    message?: string;
    passenger: TransportPassenger;
  }>(res, 'Failed to claim seat');
  return envelope.passenger;
}

export async function leaveTransportDriver(
  eventId: string,
  driverId: string,
  passengerId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/transport-drivers/${driverId}/passengers/${passengerId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error('Failed to drop seat');
}
