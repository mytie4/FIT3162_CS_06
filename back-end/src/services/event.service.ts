import * as eventRepo from "../repositories/event.repository";
import * as clubService from "./club.service";
import { CreateEventDTO, Event, EventWithClubName, UpdateEventDTO } from "../entities/event.entity";
import { ServiceError } from "../services/club.service";

export async function createEvent(dto: CreateEventDTO, userId: string): Promise<Event> {
  const title = dto.title?.trim();

  if (!userId) {
    throw new ServiceError(401, "Unauthorized. User ID is required.");
  }

  if (!dto.club_id) {
    throw new ServiceError(400, "Club ID is required.");
  }
  
  if (!title) {
    throw new ServiceError(400, "Event title is required.");
  }

  if (title.length > 100) {
    throw new ServiceError(400, "Event title cannot exceed 100 characters.");
  }

  if (dto.date && isNaN(Date.parse(dto.date))) {
    throw new ServiceError(400, "Valid event date is required.");
  }

  if (dto.end_date && isNaN(Date.parse(dto.end_date))) {
    throw new ServiceError(400, "Valid event end date is required.");
  }

  if (dto.date && dto.end_date && new Date(dto.date) > new Date(dto.end_date)) {
    throw new ServiceError(400, "Event start date cannot be after end date.");
  }

  // validate club exists
  await clubService.getClubById(dto.club_id);

  const event = await eventRepo.createEvent(
    {
      ...dto,
      title
    },
    userId
   );

   return event;
}

export async function getEventById(eventId: string): Promise<EventWithClubName> {
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

export async function getEventsByClubId(clubId: string): Promise<Event[]> {
  if (!clubId) {
    throw new ServiceError(400, "Club ID is required.");
  }

  // validate club exists
  await clubService.getClubById(clubId);

  return await eventRepo.getEventsByClubId(clubId);
}

export async function updateEvent(eventId: string, dto: UpdateEventDTO): Promise<Event> {

  if (!eventId) {
    throw new ServiceError(400, "Event ID is required.");
  }

  if (dto.title !== undefined) {
    const title = dto.title.trim();
    if (!title) {
      throw new ServiceError(400, "Event title cannot be empty.");
    }
    
    if (title.length > 100) {
      throw new ServiceError(400, "Event title cannot exceed 100 characters.");
    }
    
    dto.title = title;
  }

  if (dto.date && isNaN(Date.parse(dto.date))) {
    throw new ServiceError(400, "Valid event date is required.");
  }

  if (dto.end_date && isNaN(Date.parse(dto.end_date))) {
    throw new ServiceError(400, "Valid event end date is required.");
  }

  if (dto.date && dto.end_date && new Date(dto.date) > new Date(dto.end_date)) {
    throw new ServiceError(400, "Event start date cannot be after end date.");
  }

  const existingEvent = await eventRepo.getEventById(eventId);
  if (!existingEvent) {
    throw new ServiceError(404, "Event not found.");
  }

  const updatedEvent = await eventRepo.updateEvent(eventId, dto);
  
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