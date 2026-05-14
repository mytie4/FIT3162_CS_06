import * as contractRepo from '../repositories/contract.repository';
import * as eventRepo from '../repositories/event.repository';
import {
  CONTRACT_STATUSES,
  Contract,
  ContractStatus,
  CreateContractDTO,
  UpdateContractDTO,
} from '../entities/contract.entity';
import { ServiceError } from './club.service';

export async function listContracts(eventId: string): Promise<Contract[]> {
  await assertEventExists(eventId);
  return contractRepo.getContractsByEventId(eventId);
}

export async function createContract(
  eventId: string,
  dto: CreateContractDTO,
  userId: string,
): Promise<Contract> {
  await assertEventExists(eventId);
  const sanitized = sanitizeContractDTO(dto) as CreateContractDTO;
  if (!sanitized.title) {
    throw new ServiceError(400, 'Contract title is required.');
  }
  return contractRepo.createContract(eventId, sanitized, userId);
}

export async function updateContract(
  eventId: string,
  contractId: string,
  dto: UpdateContractDTO,
): Promise<Contract> {
  const existing = await contractRepo.getContractById(contractId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Contract not found.');
  }
  const sanitized = sanitizeContractDTO(dto) as UpdateContractDTO;
  const updated = await contractRepo.updateContract(contractId, sanitized);
  if (!updated) {
    throw new ServiceError(400, 'No valid fields provided to update.');
  }
  return updated;
}

export async function deleteContract(
  eventId: string,
  contractId: string,
): Promise<void> {
  const existing = await contractRepo.getContractById(contractId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Contract not found.');
  }
  await contractRepo.deleteContract(contractId);
}

// ---- Helpers ---------------------------------------------------------------

async function assertEventExists(eventId: string) {
  if (!eventId) throw new ServiceError(400, 'Event ID is required.');
  const event = await eventRepo.getEventById(eventId);
  if (!event) throw new ServiceError(404, 'Event not found.');
  return event;
}

function sanitizeContractDTO(
  dto: CreateContractDTO | UpdateContractDTO,
): CreateContractDTO | UpdateContractDTO {
  const cleaned: CreateContractDTO | UpdateContractDTO = { ...dto };

  if (cleaned.title !== undefined) {
    if (typeof cleaned.title !== 'string') {
      throw new ServiceError(400, 'Title must be a string.');
    }
    cleaned.title = cleaned.title.trim();
    if (cleaned.title.length === 0) {
      throw new ServiceError(400, 'Title cannot be empty.');
    }
    if (cleaned.title.length > 200) {
      throw new ServiceError(400, 'Title cannot exceed 200 characters.');
    }
  }

  if (cleaned.counterparty !== undefined && cleaned.counterparty !== null) {
    if (typeof cleaned.counterparty !== 'string') {
      throw new ServiceError(400, 'Counterparty must be a string.');
    }
    cleaned.counterparty = cleaned.counterparty.trim();
    if (cleaned.counterparty.length > 200) {
      throw new ServiceError(400, 'Counterparty cannot exceed 200 characters.');
    }
    if (cleaned.counterparty.length === 0) {
      cleaned.counterparty = null;
    }
  }

  if (cleaned.value_amount !== undefined && cleaned.value_amount !== null) {
    const raw = cleaned.value_amount;
    const num = typeof raw === 'string' ? Number(raw) : raw;
    if (typeof num !== 'number' || Number.isNaN(num) || !Number.isFinite(num)) {
      throw new ServiceError(400, 'Value must be a number.');
    }
    if (num < 0) {
      throw new ServiceError(400, 'Value cannot be negative.');
    }
    if (num > 99_999_999.99) {
      throw new ServiceError(400, 'Value exceeds maximum.');
    }
    cleaned.value_amount = num.toFixed(2);
  }

  if (cleaned.value_currency !== undefined) {
    if (typeof cleaned.value_currency !== 'string') {
      throw new ServiceError(400, 'Currency must be a string.');
    }
    cleaned.value_currency = cleaned.value_currency.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(cleaned.value_currency)) {
      throw new ServiceError(400, 'Currency must be a 3-letter ISO code.');
    }
  }

  if (cleaned.status !== undefined) {
    if (!CONTRACT_STATUSES.includes(cleaned.status as ContractStatus)) {
      throw new ServiceError(
        400,
        `Status must be one of: ${CONTRACT_STATUSES.join(', ')}.`,
      );
    }
  }

  if (cleaned.signed_date !== undefined && cleaned.signed_date !== null) {
    if (typeof cleaned.signed_date !== 'string') {
      throw new ServiceError(400, 'signed_date must be a string.');
    }
    cleaned.signed_date = cleaned.signed_date.trim();
    if (cleaned.signed_date.length === 0) {
      cleaned.signed_date = null;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned.signed_date)) {
      throw new ServiceError(400, 'signed_date must be YYYY-MM-DD.');
    }
  }

  if (cleaned.notes !== undefined && cleaned.notes !== null) {
    if (typeof cleaned.notes !== 'string') {
      throw new ServiceError(400, 'Notes must be a string.');
    }
    cleaned.notes = cleaned.notes.trim();
    if (cleaned.notes.length > 4000) {
      throw new ServiceError(400, 'Notes cannot exceed 4000 characters.');
    }
  }

  return cleaned;
}
