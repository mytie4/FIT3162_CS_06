import pool from '../db';
import {
  Contract,
  CreateContractDTO,
  UpdateContractDTO,
} from '../entities/contract.entity';

export async function getContractsByEventId(
  eventId: string,
): Promise<Contract[]> {
  const res = await pool.query<Contract>(
    `SELECT *
     FROM "Event_Contracts"
     WHERE event_id = $1
     ORDER BY created_at DESC`,
    [eventId],
  );
  return res.rows;
}

export async function getContractById(
  contractId: string,
): Promise<Contract | null> {
  const res = await pool.query<Contract>(
    `SELECT * FROM "Event_Contracts" WHERE contract_id = $1`,
    [contractId],
  );
  return res.rows[0] ?? null;
}

export async function createContract(
  eventId: string,
  dto: CreateContractDTO,
  createdBy: string,
): Promise<Contract> {
  const res = await pool.query<Contract>(
    `INSERT INTO "Event_Contracts"
        (event_id, title, counterparty, value_amount, value_currency,
         status, signed_date, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      eventId,
      dto.title,
      dto.counterparty ?? null,
      dto.value_amount ?? null,
      dto.value_currency ?? 'AUD',
      dto.status ?? 'draft',
      dto.signed_date ?? null,
      dto.notes ?? null,
      createdBy,
    ],
  );
  return res.rows[0];
}

export async function updateContract(
  contractId: string,
  dto: UpdateContractDTO,
): Promise<Contract | null> {
  const allowed: Record<string, string> = {
    title: 'title',
    counterparty: 'counterparty',
    value_amount: 'value_amount',
    value_currency: 'value_currency',
    status: 'status',
    signed_date: 'signed_date',
    notes: 'notes',
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  for (const [key, col] of Object.entries(allowed)) {
    if (key in dto) {
      setClauses.push(`"${col}" = $${i}`);
      values.push((dto as Record<string, unknown>)[key] ?? null);
      i++;
    }
  }
  if (setClauses.length === 0) return null;

  setClauses.push(`"updated_at" = NOW()`);
  values.push(contractId);

  const res = await pool.query<Contract>(
    `UPDATE "Event_Contracts"
     SET ${setClauses.join(', ')}
     WHERE contract_id = $${i}
     RETURNING *`,
    values,
  );
  return res.rows[0] ?? null;
}

export async function deleteContract(contractId: string): Promise<void> {
  await pool.query(
    `DELETE FROM "Event_Contracts" WHERE contract_id = $1`,
    [contractId],
  );
}
