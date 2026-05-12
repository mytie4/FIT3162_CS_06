import * as safetyRepo from '../repositories/safety.repository';
import * as eventRepo from '../repositories/event.repository';
import { isUserInClub } from '../repositories/club.repository';
import {
  CreateEmergencyContactDTO,
  CreateHazardDTO,
  CreateSafetyCheckDTO,
  EmergencyContact,
  Hazard,
  HazardSeverity,
  SafetyCheck,
  UpdateEmergencyContactDTO,
  UpdateHazardDTO,
  UpdateSafetyCheckDTO,
} from '../entities/safety.entity';
import { ServiceError } from './club.service';

const VALID_SEVERITIES: HazardSeverity[] = ['low', 'medium', 'high'];

// ---- Safety Checks ---------------------------------------------------------

export async function getSafetyChecks(
  eventId: string,
  userId: string,
): Promise<SafetyCheck[]> {
  await assertEventMember(eventId, userId);
  return safetyRepo.getSafetyChecksByEventId(eventId);
}

export async function createSafetyCheck(
  eventId: string,
  dto: CreateSafetyCheckDTO,
): Promise<SafetyCheck> {
  await assertEventExists(eventId);
  const sanitized = sanitizeSafetyCheckDTO(dto) as CreateSafetyCheckDTO;
  if (!sanitized.label) {
    throw new ServiceError(400, 'Safety check label is required.');
  }
  return safetyRepo.createSafetyCheck(eventId, sanitized);
}

export async function updateSafetyCheck(
  eventId: string,
  checkId: string,
  dto: UpdateSafetyCheckDTO,
  userId: string,
): Promise<SafetyCheck> {
  const existing = await safetyRepo.getSafetyCheckById(checkId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Safety check not found.');
  }
  const sanitized = sanitizeSafetyCheckDTO(dto) as UpdateSafetyCheckDTO;
  const updated = await safetyRepo.updateSafetyCheck(checkId, sanitized, userId);
  if (!updated) {
    throw new ServiceError(400, 'No valid fields provided to update.');
  }
  return updated;
}

export async function deleteSafetyCheck(
  eventId: string,
  checkId: string,
): Promise<void> {
  const existing = await safetyRepo.getSafetyCheckById(checkId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Safety check not found.');
  }
  await safetyRepo.deleteSafetyCheck(checkId);
}

// ---- Hazards ---------------------------------------------------------------

export async function getHazards(
  eventId: string,
  userId: string,
): Promise<Hazard[]> {
  await assertEventMember(eventId, userId);
  return safetyRepo.getHazardsByEventId(eventId);
}

export async function createHazard(
  eventId: string,
  dto: CreateHazardDTO,
  userId: string,
): Promise<Hazard> {
  await assertEventExists(eventId);
  const sanitized = sanitizeHazardDTO(dto) as CreateHazardDTO;
  if (!sanitized.label) {
    throw new ServiceError(400, 'Hazard label is required.');
  }
  return safetyRepo.createHazard(eventId, sanitized, userId);
}

export async function updateHazard(
  eventId: string,
  hazardId: string,
  dto: UpdateHazardDTO,
): Promise<Hazard> {
  const existing = await safetyRepo.getHazardById(hazardId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Hazard not found.');
  }
  const sanitized = sanitizeHazardDTO(dto) as UpdateHazardDTO;
  const updated = await safetyRepo.updateHazard(hazardId, sanitized);
  if (!updated) {
    throw new ServiceError(400, 'No valid fields provided to update.');
  }
  return updated;
}

export async function deleteHazard(
  eventId: string,
  hazardId: string,
): Promise<void> {
  const existing = await safetyRepo.getHazardById(hazardId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Hazard not found.');
  }
  await safetyRepo.deleteHazard(hazardId);
}

// ---- Emergency Contacts ----------------------------------------------------

export async function getEmergencyContacts(
  eventId: string,
  userId: string,
): Promise<EmergencyContact[]> {
  await assertEventMember(eventId, userId);
  return safetyRepo.getEmergencyContactsByEventId(eventId);
}

export async function createEmergencyContact(
  eventId: string,
  dto: CreateEmergencyContactDTO,
): Promise<EmergencyContact> {
  await assertEventExists(eventId);
  const sanitized = sanitizeContactDTO(dto) as CreateEmergencyContactDTO;
  if (!sanitized.name) {
    throw new ServiceError(400, 'Contact name is required.');
  }
  if (!sanitized.phone) {
    throw new ServiceError(400, 'Contact phone is required.');
  }
  return safetyRepo.createEmergencyContact(eventId, sanitized);
}

export async function updateEmergencyContact(
  eventId: string,
  contactId: string,
  dto: UpdateEmergencyContactDTO,
): Promise<EmergencyContact> {
  const existing = await safetyRepo.getEmergencyContactById(contactId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Emergency contact not found.');
  }
  const sanitized = sanitizeContactDTO(dto) as UpdateEmergencyContactDTO;
  const updated = await safetyRepo.updateEmergencyContact(contactId, sanitized);
  if (!updated) {
    throw new ServiceError(400, 'No valid fields provided to update.');
  }
  return updated;
}

export async function deleteEmergencyContact(
  eventId: string,
  contactId: string,
): Promise<void> {
  const existing = await safetyRepo.getEmergencyContactById(contactId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Emergency contact not found.');
  }
  await safetyRepo.deleteEmergencyContact(contactId);
}

// ---- Helpers ---------------------------------------------------------------

async function assertEventExists(eventId: string) {
  if (!eventId) {
    throw new ServiceError(400, 'Event ID is required.');
  }
  const event = await eventRepo.getEventById(eventId);
  if (!event) {
    throw new ServiceError(404, 'Event not found.');
  }
  return event;
}

async function assertEventMember(eventId: string, userId: string) {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized.');
  }
  const event = await assertEventExists(eventId);
  const member = await isUserInClub(userId, event.club_id);
  if (!member) {
    throw new ServiceError(403, 'You are not a member of this club.');
  }
  return event;
}

function sanitizeSafetyCheckDTO(
  dto: CreateSafetyCheckDTO | UpdateSafetyCheckDTO,
): CreateSafetyCheckDTO | UpdateSafetyCheckDTO {
  const cleaned: CreateSafetyCheckDTO | UpdateSafetyCheckDTO = { ...dto };

  if (cleaned.label !== undefined) {
    if (typeof cleaned.label !== 'string') {
      throw new ServiceError(400, 'Safety check label must be a string.');
    }
    cleaned.label = cleaned.label.trim();
    if (cleaned.label.length === 0) {
      throw new ServiceError(400, 'Safety check label cannot be empty.');
    }
    if (cleaned.label.length > 200) {
      throw new ServiceError(400, 'Safety check label cannot exceed 200 characters.');
    }
  }

  if (cleaned.description !== undefined && cleaned.description !== null) {
    if (typeof cleaned.description !== 'string') {
      throw new ServiceError(400, 'Safety check description must be a string.');
    }
    cleaned.description = cleaned.description.trim();
    if (cleaned.description.length > 2000) {
      throw new ServiceError(400, 'Safety check description cannot exceed 2000 characters.');
    }
  }

  if (cleaned.required !== undefined && typeof cleaned.required !== 'boolean') {
    throw new ServiceError(400, 'Safety check "required" must be a boolean.');
  }

  if ('completed' in cleaned && cleaned.completed !== undefined && typeof cleaned.completed !== 'boolean') {
    throw new ServiceError(400, 'Safety check "completed" must be a boolean.');
  }

  if (cleaned.sort_order !== undefined) {
    if (typeof cleaned.sort_order !== 'number' || !Number.isInteger(cleaned.sort_order)) {
      throw new ServiceError(400, 'sort_order must be an integer.');
    }
  }

  return cleaned;
}

function sanitizeHazardDTO(
  dto: CreateHazardDTO | UpdateHazardDTO,
): CreateHazardDTO | UpdateHazardDTO {
  const cleaned: CreateHazardDTO | UpdateHazardDTO = { ...dto };

  if (cleaned.label !== undefined) {
    if (typeof cleaned.label !== 'string') {
      throw new ServiceError(400, 'Hazard label must be a string.');
    }
    cleaned.label = cleaned.label.trim();
    if (cleaned.label.length === 0) {
      throw new ServiceError(400, 'Hazard label cannot be empty.');
    }
    if (cleaned.label.length > 120) {
      throw new ServiceError(400, 'Hazard label cannot exceed 120 characters.');
    }
  }

  if (cleaned.severity !== undefined) {
    if (!VALID_SEVERITIES.includes(cleaned.severity)) {
      throw new ServiceError(
        400,
        `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}.`,
      );
    }
  }

  if (cleaned.notes !== undefined && cleaned.notes !== null) {
    if (typeof cleaned.notes !== 'string') {
      throw new ServiceError(400, 'Hazard notes must be a string.');
    }
    cleaned.notes = cleaned.notes.trim();
    if (cleaned.notes.length > 2000) {
      throw new ServiceError(400, 'Hazard notes cannot exceed 2000 characters.');
    }
  }

  return cleaned;
}

function sanitizeContactDTO(
  dto: CreateEmergencyContactDTO | UpdateEmergencyContactDTO,
): CreateEmergencyContactDTO | UpdateEmergencyContactDTO {
  const cleaned: CreateEmergencyContactDTO | UpdateEmergencyContactDTO = { ...dto };

  if (cleaned.name !== undefined) {
    if (typeof cleaned.name !== 'string') {
      throw new ServiceError(400, 'Contact name must be a string.');
    }
    cleaned.name = cleaned.name.trim();
    if (cleaned.name.length === 0) {
      throw new ServiceError(400, 'Contact name cannot be empty.');
    }
    if (cleaned.name.length > 120) {
      throw new ServiceError(400, 'Contact name cannot exceed 120 characters.');
    }
  }

  if (cleaned.role !== undefined && cleaned.role !== null) {
    if (typeof cleaned.role !== 'string') {
      throw new ServiceError(400, 'Contact role must be a string.');
    }
    cleaned.role = cleaned.role.trim();
    if (cleaned.role.length > 60) {
      throw new ServiceError(400, 'Contact role cannot exceed 60 characters.');
    }
  }

  if (cleaned.phone !== undefined) {
    if (typeof cleaned.phone !== 'string') {
      throw new ServiceError(400, 'Contact phone must be a string.');
    }
    cleaned.phone = cleaned.phone.trim();
    if (cleaned.phone.length === 0) {
      throw new ServiceError(400, 'Contact phone cannot be empty.');
    }
    if (cleaned.phone.length > 30) {
      throw new ServiceError(400, 'Contact phone cannot exceed 30 characters.');
    }
  }

  if (cleaned.notes !== undefined && cleaned.notes !== null) {
    if (typeof cleaned.notes !== 'string') {
      throw new ServiceError(400, 'Contact notes must be a string.');
    }
    cleaned.notes = cleaned.notes.trim();
    if (cleaned.notes.length > 2000) {
      throw new ServiceError(400, 'Contact notes cannot exceed 2000 characters.');
    }
  }

  if (cleaned.sort_order !== undefined) {
    if (typeof cleaned.sort_order !== 'number' || !Number.isInteger(cleaned.sort_order)) {
      throw new ServiceError(400, 'sort_order must be an integer.');
    }
  }

  return cleaned;
}
