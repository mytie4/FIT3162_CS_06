import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled';

export const CONTRACT_STATUSES: readonly ContractStatus[] = [
  'draft',
  'sent',
  'signed',
  'cancelled',
];

export interface Contract {
  contract_id: string;
  event_id: string;
  title: string;
  counterparty: string | null;
  value_amount: string | null;
  value_currency: string;
  status: ContractStatus;
  signed_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractInput {
  title: string;
  counterparty?: string | null;
  value_amount?: number | null;
  value_currency?: string;
  status?: ContractStatus;
  signed_date?: string | null;
  notes?: string | null;
}

export async function listContracts(
  eventId: string,
  token: string,
): Promise<Contract[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/contracts`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return parseJsonSafe<Contract[]>(res, 'Failed to load contracts');
}

export async function createContract(
  eventId: string,
  dto: ContractInput,
  token: string,
): Promise<Contract> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/contracts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    },
  );
  const envelope = await parseJsonSafe<{ message?: string; contract: Contract }>(
    res,
    'Failed to create contract',
  );
  return envelope.contract;
}

export async function updateContract(
  eventId: string,
  contractId: string,
  dto: ContractInput,
  token: string,
): Promise<Contract> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/contracts/${contractId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    },
  );
  const envelope = await parseJsonSafe<{ message?: string; contract: Contract }>(
    res,
    'Failed to update contract',
  );
  return envelope.contract;
}

export async function deleteContract(
  eventId: string,
  contractId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/events/${eventId}/contracts/${contractId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error('Failed to delete contract');
}
