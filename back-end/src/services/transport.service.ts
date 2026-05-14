import * as transportRepo from '../repositories/transport.repository';
import * as eventRepo from '../repositories/event.repository';
import { getUserRoleInClub, isUserInClub } from '../repositories/club.repository';
import {
  CreateTransportDriverDTO,
  TransportDriver,
  TransportPassenger,
  UpdateTransportDriverDTO,
} from '../entities/transport.entity';
import { ServiceError } from './club.service';

const OFFICER_ROLES = ['president', 'vice_president'] as const;

// ---- Drivers ---------------------------------------------------------------

export async function listDrivers(
  eventId: string,
  userId: string,
): Promise<TransportDriver[]> {
  await assertEventMember(eventId, userId);
  return transportRepo.getDriversByEventId(eventId);
}

export async function createDriver(
  eventId: string,
  dto: CreateTransportDriverDTO,
  userId: string,
): Promise<TransportDriver> {
  await assertEventExists(eventId);
  const sanitized = sanitizeDriverDTO(dto) as CreateTransportDriverDTO;
  if (!sanitized.driver_name) {
    throw new ServiceError(400, 'Driver name is required.');
  }
  if (!sanitized.departure_location) {
    throw new ServiceError(400, 'Departure location is required.');
  }
  if (!sanitized.departure_time) {
    throw new ServiceError(400, 'Departure time is required.');
  }
  if (sanitized.seats_total === undefined) {
    throw new ServiceError(400, 'Seats total is required.');
  }
  return transportRepo.createDriver(eventId, sanitized, userId);
}

export async function updateDriver(
  eventId: string,
  driverId: string,
  dto: UpdateTransportDriverDTO,
): Promise<TransportDriver> {
  const existing = await transportRepo.getDriverById(driverId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Driver not found.');
  }
  const sanitized = sanitizeDriverDTO(dto) as UpdateTransportDriverDTO;

  if (sanitized.seats_total !== undefined) {
    const taken = await transportRepo.countPassengersForDriver(driverId);
    if (sanitized.seats_total < taken) {
      throw new ServiceError(
        400,
        `Cannot reduce seats below current passenger count (${taken}).`,
      );
    }
  }

  const updated = await transportRepo.updateDriver(driverId, sanitized);
  if (!updated) {
    throw new ServiceError(400, 'No valid fields provided to update.');
  }
  const refreshed = await transportRepo.getDriverById(driverId);
  if (!refreshed) {
    throw new ServiceError(404, 'Driver not found.');
  }
  return refreshed;
}

export async function deleteDriver(
  eventId: string,
  driverId: string,
): Promise<void> {
  const existing = await transportRepo.getDriverById(driverId);
  if (!existing || existing.event_id !== eventId) {
    throw new ServiceError(404, 'Driver not found.');
  }
  await transportRepo.deleteDriver(driverId);
}

// ---- Passengers ------------------------------------------------------------

export async function addPassenger(
  eventId: string,
  driverId: string,
  callerUserId: string,
  targetUserId: string | undefined,
): Promise<TransportPassenger> {
  const event = await assertEventMember(eventId, callerUserId);
  const driver = await transportRepo.getDriverById(driverId);
  if (!driver || driver.event_id !== eventId) {
    throw new ServiceError(404, 'Driver not found.');
  }

  let userId = callerUserId;
  if (targetUserId && targetUserId !== callerUserId) {
    // Officer-only when adding someone else.
    const role = await getUserRoleInClub(callerUserId, event.club_id);
    if (!role || !OFFICER_ROLES.includes(role as (typeof OFFICER_ROLES)[number])) {
      throw new ServiceError(403, 'Only officers can sign someone else up.');
    }
    const memberOk = await isUserInClub(targetUserId, event.club_id);
    if (!memberOk) {
      throw new ServiceError(400, 'That user is not a member of this club.');
    }
    userId = targetUserId;
  }

  const taken = await transportRepo.countPassengersForDriver(driverId);
  if (taken >= driver.seats_total) {
    throw new ServiceError(400, 'This car is full.');
  }

  const existing = await transportRepo.getPassengerForEvent(eventId, userId);
  if (existing) {
    throw new ServiceError(409, 'That user is already signed up for this event.');
  }

  try {
    return await transportRepo.createPassenger(driverId, userId);
  } catch (error: any) {
    if (error?.code === '23505') {
      throw new ServiceError(409, 'That user is already signed up for this event.');
    }
    throw error;
  }
}

export async function removePassenger(
  eventId: string,
  driverId: string,
  passengerId: string,
  callerUserId: string,
): Promise<void> {
  const event = await assertEventMember(eventId, callerUserId);
  const driver = await transportRepo.getDriverById(driverId);
  if (!driver || driver.event_id !== eventId) {
    throw new ServiceError(404, 'Driver not found.');
  }
  const passenger = await transportRepo.getPassengerById(passengerId);
  if (!passenger || passenger.driver_id !== driverId) {
    throw new ServiceError(404, 'Passenger not found.');
  }

  if (passenger.user_id !== callerUserId) {
    // Officer-only when removing someone else.
    const role = await getUserRoleInClub(callerUserId, event.club_id);
    if (!role || !OFFICER_ROLES.includes(role as (typeof OFFICER_ROLES)[number])) {
      throw new ServiceError(403, 'Only officers can remove another passenger.');
    }
  }

  await transportRepo.deletePassenger(passengerId);
}

// ---- Helpers ---------------------------------------------------------------

async function assertEventExists(eventId: string) {
  if (!eventId) throw new ServiceError(400, 'Event ID is required.');
  const event = await eventRepo.getEventById(eventId);
  if (!event) throw new ServiceError(404, 'Event not found.');
  return event;
}

async function assertEventMember(eventId: string, userId: string) {
  if (!userId) throw new ServiceError(401, 'Unauthorized.');
  const event = await assertEventExists(eventId);
  const member = await isUserInClub(userId, event.club_id);
  if (!member) {
    throw new ServiceError(403, 'You are not a member of this club.');
  }
  return event;
}

function sanitizeDriverDTO(
  dto: CreateTransportDriverDTO | UpdateTransportDriverDTO,
): CreateTransportDriverDTO | UpdateTransportDriverDTO {
  const cleaned: CreateTransportDriverDTO | UpdateTransportDriverDTO = { ...dto };

  if (cleaned.driver_name !== undefined) {
    if (typeof cleaned.driver_name !== 'string') {
      throw new ServiceError(400, 'Driver name must be a string.');
    }
    cleaned.driver_name = cleaned.driver_name.trim();
    if (cleaned.driver_name.length === 0) {
      throw new ServiceError(400, 'Driver name cannot be empty.');
    }
    if (cleaned.driver_name.length > 120) {
      throw new ServiceError(400, 'Driver name cannot exceed 120 characters.');
    }
  }

  if (cleaned.vehicle !== undefined && cleaned.vehicle !== null) {
    if (typeof cleaned.vehicle !== 'string') {
      throw new ServiceError(400, 'Vehicle must be a string.');
    }
    cleaned.vehicle = cleaned.vehicle.trim();
    if (cleaned.vehicle.length > 120) {
      throw new ServiceError(400, 'Vehicle cannot exceed 120 characters.');
    }
  }

  if (cleaned.seats_total !== undefined) {
    if (
      typeof cleaned.seats_total !== 'number' ||
      !Number.isInteger(cleaned.seats_total)
    ) {
      throw new ServiceError(400, 'Seats total must be an integer.');
    }
    if (cleaned.seats_total < 1 || cleaned.seats_total > 50) {
      throw new ServiceError(400, 'Seats total must be between 1 and 50.');
    }
  }

  if (cleaned.departure_location !== undefined) {
    if (typeof cleaned.departure_location !== 'string') {
      throw new ServiceError(400, 'Departure location must be a string.');
    }
    cleaned.departure_location = cleaned.departure_location.trim();
    if (cleaned.departure_location.length === 0) {
      throw new ServiceError(400, 'Departure location cannot be empty.');
    }
    if (cleaned.departure_location.length > 200) {
      throw new ServiceError(400, 'Departure location cannot exceed 200 characters.');
    }
  }

  if (cleaned.departure_time !== undefined) {
    if (typeof cleaned.departure_time !== 'string') {
      throw new ServiceError(400, 'Departure time must be an ISO string.');
    }
    const parsed = new Date(cleaned.departure_time);
    if (Number.isNaN(parsed.getTime())) {
      throw new ServiceError(400, 'Departure time is not a valid date.');
    }
  }

  if (cleaned.notes !== undefined && cleaned.notes !== null) {
    if (typeof cleaned.notes !== 'string') {
      throw new ServiceError(400, 'Notes must be a string.');
    }
    cleaned.notes = cleaned.notes.trim();
    if (cleaned.notes.length > 2000) {
      throw new ServiceError(400, 'Notes cannot exceed 2000 characters.');
    }
  }

  if (cleaned.driver_user_id !== undefined && cleaned.driver_user_id !== null) {
    if (typeof cleaned.driver_user_id !== 'string') {
      throw new ServiceError(400, 'driver_user_id must be a string.');
    }
  }

  return cleaned;
}
