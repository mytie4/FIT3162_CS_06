import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

export interface SafetyCheck {
  check_id: string;
  event_id: string;
  label: string;
  description: string | null;
  required: boolean;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  sort_order: number;
  created_at: string;
}

export async function listSafetyChecks(
  eventId: string,
  token: string,
): Promise<SafetyCheck[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events/${eventId}/safety-checks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonSafe<SafetyCheck[]>(res, 'Failed to load safety checks');
}

export async function setSafetyCheckCompleted(
  eventId: string,
  checkId: string,
  completed: boolean,
  token: string,
): Promise<SafetyCheck> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/safety-checks/${checkId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed }),
    },
  );
  const envelope = await parseJsonSafe<{ message?: string; check: SafetyCheck }>(
    res,
    'Failed to update safety check',
  );
  return envelope.check;
}

// ---- Emergency Contacts ----------------------------------------------------

export interface EmergencyContact {
  contact_id: string;
  event_id: string;
  name: string;
  role: string | null;
  phone: string;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export async function listEmergencyContacts(
  eventId: string,
  token: string,
): Promise<EmergencyContact[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/emergency-contacts`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return parseJsonSafe<EmergencyContact[]>(res, 'Failed to load emergency contacts');
}

export async function createEmergencyContact(
  eventId: string,
  dto: { name: string; role?: string; phone: string },
  token: string,
): Promise<EmergencyContact> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/emergency-contacts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    },
  );
  const envelope = await parseJsonSafe<{ message?: string; contact: EmergencyContact }>(
    res,
    'Failed to create emergency contact',
  );
  return envelope.contact;
}

export async function deleteEmergencyContact(
  eventId: string,
  contactId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/emergency-contacts/${contactId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) {
    throw new Error('Failed to delete emergency contact');
  }
}
