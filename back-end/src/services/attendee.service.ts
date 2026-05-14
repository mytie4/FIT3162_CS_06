import * as attendeeRepo from '../repositories/attendee.repository';
import * as eventRepo from '../repositories/event.repository';
import { isUserInClub } from '../repositories/club.repository';
import { Attendee, CreateAttendeeDTO } from '../entities/attendee.entity';
import { ServiceError } from './club.service';

export async function listAttendees(
  eventId: string,
  userId: string,
): Promise<Attendee[]> {
  await assertEventMember(eventId, userId);
  return attendeeRepo.getAttendeesByEventId(eventId);
}

export async function addAttendee(
  eventId: string,
  dto: CreateAttendeeDTO,
): Promise<Attendee> {
  const event = await assertEventExists(eventId);

  const targetUserId = typeof dto.user_id === 'string' ? dto.user_id.trim() : '';
  if (!targetUserId) {
    throw new ServiceError(400, 'user_id is required.');
  }

  const member = await isUserInClub(targetUserId, event.club_id);
  if (!member) {
    throw new ServiceError(400, 'That user is not a member of this club.');
  }

  const existing = await attendeeRepo.getAttendeeByEventAndUser(eventId, targetUserId);
  if (existing) {
    throw new ServiceError(409, 'That member is already on the roster.');
  }

  return attendeeRepo.createAttendee(eventId, targetUserId);
}

export async function removeAttendee(
  eventId: string,
  userId: string,
): Promise<void> {
  await assertEventExists(eventId);
  if (!userId) {
    throw new ServiceError(400, 'user_id is required.');
  }
  const removed = await attendeeRepo.deleteAttendee(eventId, userId);
  if (!removed) {
    throw new ServiceError(404, 'Attendee not found.');
  }
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
