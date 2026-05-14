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
  value_amount: string | null; // numeric serialised as string by pg
  value_currency: string;
  status: ContractStatus;
  signed_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContractDTO {
  title: string;
  counterparty?: string | null;
  value_amount?: number | string | null;
  value_currency?: string;
  status?: ContractStatus;
  signed_date?: string | null;
  notes?: string | null;
}

export interface UpdateContractDTO {
  title?: string;
  counterparty?: string | null;
  value_amount?: number | string | null;
  value_currency?: string;
  status?: ContractStatus;
  signed_date?: string | null;
  notes?: string | null;
}
