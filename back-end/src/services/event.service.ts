import * as eventRepo from "../repositories/event.repository";
import * as clubService from "./club.service";
import {
  CreateEventDTO,
  Event,
  EventWithClubName,
  UpdateEventDTO,
} from "../entities/event.entity";
import { ServiceError } from "../services/club.service";

export async function createEvent(
  dto: CreateEventDTO,
  userId: string,
): Promise<Event> {
  if (!userId) {
    throw new ServiceError(401, "Unauthorized. User ID is required.");
  }

  if (!dto.club_id) {
    throw new ServiceError(400, "Club ID is required.");
  }

  if (dto.title === undefined || !dto.title.trim()) {
    throw new ServiceError(400, "Event title is required.");
  }

  // validate input fields
  const sanitizedDTO = sanitizeAndValidateEventDTO(dto) as CreateEventDTO;

  // validate club exists
  await clubService.getClubById(sanitizedDTO.club_id);

  const event = await eventRepo.createEvent(sanitizedDTO, userId);
  return event;
}

export async function getEventById(
  eventId: string,
): Promise<EventWithClubName> {
  if (!eventId) {
    throw new ServiceError(400, "Event ID is required.");
  }

  const event = await eventRepo.getEventById(eventId);

  if (!event) {
    throw new ServiceError(404, "Event not found.");
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
    throw new ServiceError(401, "Unauthorized");
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
    throw new ServiceError(400, "Club ID is required.");
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
): Promise<Event> {
  if (!eventId) {
    throw new ServiceError(400, "Event ID is required.");
  }

  const existingEvent = await eventRepo.getEventById(eventId);
  if (!existingEvent) {
    throw new ServiceError(404, "Event not found.");
  }

  const sanitizedDTO = sanitizeAndValidateEventDTO(dto) as UpdateEventDTO;

  const updatedEvent = await eventRepo.updateEvent(eventId, sanitizedDTO);

  if (!updatedEvent) {
    throw new ServiceError(500, "Failed to update event.");
  }

  return updatedEvent;
}

export async function deleteEvent(eventId: string): Promise<void> {
  if (!eventId) {
    throw new ServiceError(400, "Event ID is required.");
  }

  const existingEvent = await eventRepo.getEventById(eventId);
  if (!existingEvent) {
    throw new ServiceError(404, "Event not found.");
  }

  await eventRepo.deleteEvent(eventId);
}

function sanitizeAndValidateEventDTO(
  dto: CreateEventDTO | UpdateEventDTO,
): CreateEventDTO | UpdateEventDTO {
  const cleaned: CreateEventDTO | UpdateEventDTO = { ...dto };

  if (cleaned.title !== undefined) {
    cleaned.title = cleaned.title.trim();

    if (!cleaned.title) {
      throw new ServiceError(400, "Event title cannot be empty.");
    }

    if (cleaned.title.length > 100) {
      throw new ServiceError(400, "Event title cannot exceed 100 characters.");
    }
  }

  if (cleaned.date && isNaN(Date.parse(cleaned.date))) {
    throw new ServiceError(400, "Valid event date is required.");
  }

  if (cleaned.end_date && isNaN(Date.parse(cleaned.end_date))) {
    throw new ServiceError(400, "Valid event end date is required.");
  }

  if (
    cleaned.date &&
    cleaned.end_date &&
    new Date(cleaned.date) > new Date(cleaned.end_date)
  ) {
    throw new ServiceError(400, "Event start date cannot be after end date.");
  }

  if (cleaned.type !== undefined) {
    cleaned.type = cleaned.type.trim();

    if (!cleaned.type) {
      throw new ServiceError(400, "Event type cannot be empty.");
    }

    if (cleaned.type.length > 50) {
      throw new ServiceError(400, "Event type cannot exceed 50 characters.");
    }
  }

  if (cleaned.description !== undefined) {
    cleaned.description = cleaned.description.trim();

    if (!cleaned.description) {
      throw new ServiceError(400, "Event description cannot be empty.");
    }

    if (cleaned.description.length > 500) {
      throw new ServiceError(
        400,
        "Event description cannot exceed 500 characters.",
      );
    }
  }

  if (cleaned.location !== undefined) {
    cleaned.location = cleaned.location.trim();

    if (!cleaned.location) {
      throw new ServiceError(400, "Event location cannot be empty.");
    }
    if (cleaned.location.length > 100) {
      throw new ServiceError(
        400,
        "Event location cannot exceed 100 characters.",
      );
    }
  }

  if (cleaned.budget !== undefined) {
    if (typeof cleaned.budget !== "number" || cleaned.budget < 0) {
      throw new ServiceError(
        400,
        "Event budget must be a non-negative number.",
      );
    }
  }

  if (cleaned.banner_url !== undefined) {
    cleaned.banner_url = cleaned.banner_url.trim();

    if (!cleaned.banner_url) {
      throw new ServiceError(400, "Event banner URL cannot be empty.");
    }

    try {
      new URL(cleaned.banner_url);
    } catch {
      throw new ServiceError(400, "Event banner URL is invalid.");
    }
  }

  if (cleaned.status !== undefined) {
    const VALID_STATUSES = [
      "draft",
      "published",
      "ongoing",
      "completed",
      "cancelled",
    ];
    if (!VALID_STATUSES.includes(cleaned.status)) {
      throw new ServiceError(400, "Invalid event status.");
    }
  }

  return cleaned;
}
