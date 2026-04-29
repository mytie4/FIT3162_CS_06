import { Response } from 'express';
import * as eventService from '../services/event.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateEventDTO, UpdateEventDTO } from '../entities/event.entity';
import { ServiceError } from '../services/club.service';

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dto: CreateEventDTO = req.body;
    const event = await eventService.createEvent(dto, userId);

    return res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(
      'Create event failed:',
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function getEventById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    return res.status(200).json(event);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(
      'Get event by ID failed:',
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function getEventsByClubId(req: AuthRequest, res: Response) {
  try {
    const { clubId } = req.params;
    const events = await eventService.getEventsByClubId(clubId);
    return res.status(200).json(events);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(
      'Get events by club ID failed:',
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function updateEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const dto: UpdateEventDTO = req.body;
    const updatedEvent = await eventService.updateEvent(id, dto);
    return res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(
      'Update event failed:',
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(
      'Delete event failed:',
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function getAllEvents(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const events = await eventService.getAllEvents(userId);
    return res.status(200).json(events);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(
      'Get all events failed:',
      error instanceof Error ? error.message : error,
    );

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}
