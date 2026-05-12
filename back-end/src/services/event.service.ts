import * as eventRepo from '../repositories/event.repository';
import * as clubService from './club.service';
import * as notificationService from './notification.service';
import * as notificationRepo from '../repositories/notification.repository';
import * as userRepo from '../repositories/user.repository';
import * as safetyRepo from '../repositories/safety.repository';
import {
  CreateEventDTO,
  Event,
  EventWithClubName,
  UpdateEventDTO,
} from '../entities/event.entity';
import { ServiceError } from '../services/club.service';

// Field-level changes that are interesting enough to notify members about.
// Cosmetic-only updates (e.g. banner_url) deliberately do not trigger a
// notification storm.
const NOTIFIABLE_EVENT_FIELDS = new Set<keyof UpdateEventDTO>([
  'title',
  'date',
  'end_date',
  'location',
  'description',
  'status',
]);

export async function createEvent(
  dto: CreateEventDTO,
  userId: string,
): Promise<Event> {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized. User ID is required.');
  }

  if (!dto.club_id) {
    throw new ServiceError(400, 'Club ID is required.');
  }

  if (dto.title === undefined || !dto.title.trim()) {
    throw new ServiceError(400, 'Event title is required.');
  }

  // validate input fields
  const sanitizedDTO = sanitizeAndValidateEventDTO(dto) as CreateEventDTO;

  // validate club exists
  await clubService.getClubById(sanitizedDTO.club_id);

  const event = await eventRepo.createEvent(sanitizedDTO, userId);

  // Seed the default safety checklist for every new event. Best-effort: if
  // seeding fails we still return the created event rather than rolling back,
  // because the organiser can re-add checks manually from the Safety tab.
  try {
    await safetyRepo.seedDefaultSafetyChecks(event.event_id);
  } catch (err) {
    console.error('[safety] failed to seed default checks for event', event.event_id, err);
  }

  return event;
}

export async function getEventById(
  eventId: string,
): Promise<EventWithClubName> {
  if (!eventId) {
    throw new ServiceError(400, 'Event ID is required.');
  }

  const event = await eventRepo.getEventById(eventId);

  if (!event) {
    throw new ServiceError(404, 'Event not found.');
  }

  return {
    ...event,
    attendee_count: Number(event.attendee_count),
  };
}

export async function getAllEvents(
  userId: string,
): Promise<EventWithClubName[]> {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized');
  }

  const events = await eventRepo.getAllEvents(userId);

  return events.map((event) => ({
    ...event,
    attendee_count: Number(event.attendee_count),
  }));
}

export async function getEventsByClubId(
  clubId: string,
): Promise<EventWithClubName[]> {
  if (!clubId) {
    throw new ServiceError(400, 'Club ID is required.');
  }

  await clubService.getClubById(clubId);

  const events = await eventRepo.getEventsByClubId(clubId);

  return events.map((event) => ({
    ...event,
    attendee_count: Number(event.attendee_count),
  }));
}

export async function updateEvent(
  eventId: string,
  dto: UpdateEventDTO,
  senderUserId?: string,
): Promise<Event> {
  if (!eventId) {
    throw new ServiceError(400, 'Event ID is required.');
  }

  const existingEvent = await eventRepo.getEventById(eventId);
  if (!existingEvent) {
    throw new ServiceError(404, 'Event not found.');
  }

  const sanitizedDTO = sanitizeAndValidateEventDTO(dto) as UpdateEventDTO;

  // Publish gate: a draft event cannot transition to `published` while any
  // required safety check is still open. Update from anything-other-than-draft
  // is unaffected (e.g. published -> ongoing, completed) so we only check the
  // specific draft -> published transition.
  if (
    sanitizedDTO.status === 'published' &&
    existingEvent.status === 'draft'
  ) {
    const incomplete = await safetyRepo.countIncompleteRequiredChecks(eventId);
    if (incomplete > 0) {
      throw new ServiceError(
        400,
        `Cannot publish: ${incomplete} required safety check${incomplete === 1 ? '' : 's'} still incomplete.`,
      );
    }
  }

  const updatedEvent = await eventRepo.updateEvent(eventId, sanitizedDTO);

  if (!updatedEvent) {
    throw new ServiceError(500, 'Failed to update event.');
  }

  try {
    const changedFields = (Object.keys(sanitizedDTO) as Array<keyof UpdateEventDTO>)
      .filter((k) => sanitizedDTO[k] !== undefined)
      .filter((k) => NOTIFIABLE_EVENT_FIELDS.has(k));

    if (changedFields.length > 0) {
      const recipientIds = await notificationRepo.getClubMemberIds(
        existingEvent.club_id,
      );
      const recipients = senderUserId
        ? recipientIds.filter((id) => id !== senderUserId)
        : recipientIds;

      if (recipients.length > 0) {
        const sender = senderUserId
          ? await userRepo.findById(senderUserId)
          : null;

        await notificationService.emitEventUpdate({
          recipientUserIds: recipients,
          eventId: updatedEvent.event_id,
          eventTitle: updatedEvent.title ?? existingEvent.title ?? 'Event',
          clubId: existingEvent.club_id,
          clubName: existingEvent.club_name,
          changeSummary: changedFields.join(', '),
          senderId: senderUserId,
          senderName: sender?.name ?? undefined,
        });
      }
    }
  } catch (err) {
    console.error('[notifications] event_update wiring failed', err);
  }

  return updatedEvent;
}

export async function deleteEvent(eventId: string): Promise<void> {
  if (!eventId) {
    throw new ServiceError(400, 'Event ID is required.');
  }

  const existingEvent = await eventRepo.getEventById(eventId);
  if (!existingEvent) {
    throw new ServiceError(404, 'Event not found.');
  }

  await eventRepo.deleteEvent(eventId);
}

function sanitizeAndValidateEventDTO(
  dto: CreateEventDTO | UpdateEventDTO,
): CreateEventDTO | UpdateEventDTO {
  const cleaned: CreateEventDTO | UpdateEventDTO = { ...dto };

  // title: required column, cannot be null. Only validate when provided.
  if (cleaned.title !== undefined) {
    if (typeof cleaned.title !== 'string') {
      throw new ServiceError(400, 'Event title cannot be empty.');
    }
    cleaned.title = cleaned.title.trim();

    if (!cleaned.title) {
      throw new ServiceError(400, 'Event title cannot be empty.');
    }

    if (cleaned.title.length > 100) {
      throw new ServiceError(400, 'Event title cannot exceed 100 characters.');
    }
  }

  // Nullable date columns: null clears, string must parse.
  if (typeof cleaned.date === 'string' && isNaN(Date.parse(cleaned.date))) {
    throw new ServiceError(400, 'Valid event date is required.');
  }

  if (typeof cleaned.end_date === 'string' && isNaN(Date.parse(cleaned.end_date))) {
    throw new ServiceError(400, 'Valid event end date is required.');
  }

  if (
    typeof cleaned.date === 'string' &&
    typeof cleaned.end_date === 'string' &&
    new Date(cleaned.date) > new Date(cleaned.end_date)
  ) {
    throw new ServiceError(400, 'Event start date cannot be after end date.');
  }

  // Nullable string columns: null passes through (clears the column); strings
  // get trimmed and validated. Empty-after-trim is rejected — callers should
  // send null to clear, not empty string.
  if (typeof cleaned.type === 'string') {
    cleaned.type = cleaned.type.trim();
    if (!cleaned.type) {
      throw new ServiceError(400, 'Event type cannot be empty.');
    }
    if (cleaned.type.length > 50) {
      throw new ServiceError(400, 'Event type cannot exceed 50 characters.');
    }
  }

  if (typeof cleaned.description === 'string') {
    cleaned.description = cleaned.description.trim();
    if (!cleaned.description) {
      throw new ServiceError(400, 'Event description cannot be empty.');
    }
    if (cleaned.description.length > 500) {
      throw new ServiceError(
        400,
        'Event description cannot exceed 500 characters.',
      );
    }
  }

  if (typeof cleaned.location === 'string') {
    cleaned.location = cleaned.location.trim();
    if (!cleaned.location) {
      throw new ServiceError(400, 'Event location cannot be empty.');
    }
    if (cleaned.location.length > 100) {
      throw new ServiceError(
        400,
        'Event location cannot exceed 100 characters.',
      );
    }
  }

  if (cleaned.budget !== undefined && cleaned.budget !== null) {
    if (typeof cleaned.budget !== 'number' || cleaned.budget < 0) {
      throw new ServiceError(
        400,
        'Event budget must be a non-negative number.',
      );
    }
  }

  if (typeof cleaned.banner_url === 'string') {
    cleaned.banner_url = cleaned.banner_url.trim();
    if (!cleaned.banner_url) {
      throw new ServiceError(400, 'Event banner URL cannot be empty.');
    }
    try {
      new URL(cleaned.banner_url);
    } catch {
      throw new ServiceError(400, 'Event banner URL is invalid.');
    }
  }

  if (cleaned.status !== undefined) {
    const VALID_STATUSES = [
      'draft',
      'published',
      'ongoing',
      'completed',
      'cancelled',
    ];
    if (!VALID_STATUSES.includes(cleaned.status)) {
      throw new ServiceError(400, 'Invalid event status.');
    }
  }

  return cleaned;
}
