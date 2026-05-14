import { Response } from 'express';
import * as attendeeService from '../services/attendee.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateAttendeeDTO } from '../entities/attendee.entity';
import { ServiceError } from '../services/club.service';

function handleError(res: Response, error: unknown, context: string) {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`${context} failed:`, error instanceof Error ? error.message : error);
  return res.status(500).json({ error: 'Internal server error' });
}

export async function listAttendees(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { eventId } = req.params;
    const attendees = await attendeeService.listAttendees(eventId, userId);
    return res.status(200).json(attendees);
  } catch (error) {
    return handleError(res, error, 'List attendees');
  }
}

export async function addAttendee(req: AuthRequest, res: Response) {
  try {
    const { eventId } = req.params;
    const dto: CreateAttendeeDTO = {
      user_id: typeof req.body?.user_id === 'string' ? req.body.user_id : '',
    };
    const attendee = await attendeeService.addAttendee(eventId, dto);
    return res.status(201).json({ message: 'Attendee added', attendee });
  } catch (error) {
    return handleError(res, error, 'Add attendee');
  }
}

export async function removeAttendee(req: AuthRequest, res: Response) {
  try {
    const { eventId, userId } = req.params;
    await attendeeService.removeAttendee(eventId, userId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, 'Remove attendee');
  }
}
