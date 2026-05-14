import { Response } from 'express';
import * as transportService from '../services/transport.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  CreateTransportDriverDTO,
  UpdateTransportDriverDTO,
} from '../entities/transport.entity';
import { ServiceError } from '../services/club.service';

function handleError(res: Response, error: unknown, context: string) {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`${context} failed:`, error instanceof Error ? error.message : error);
  return res.status(500).json({ error: 'Internal server error' });
}

export async function listDrivers(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { eventId } = req.params;
    const drivers = await transportService.listDrivers(eventId, userId);
    return res.status(200).json(drivers);
  } catch (error) {
    return handleError(res, error, 'List transport drivers');
  }
}

export async function createDriver(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { eventId } = req.params;
    const dto: CreateTransportDriverDTO = req.body ?? {};
    const driver = await transportService.createDriver(eventId, dto, userId);
    return res.status(201).json({ message: 'Driver created', driver });
  } catch (error) {
    return handleError(res, error, 'Create transport driver');
  }
}

export async function updateDriver(req: AuthRequest, res: Response) {
  try {
    const { eventId, driverId } = req.params;
    const dto: UpdateTransportDriverDTO = req.body ?? {};
    const driver = await transportService.updateDriver(eventId, driverId, dto);
    return res.status(200).json({ message: 'Driver updated', driver });
  } catch (error) {
    return handleError(res, error, 'Update transport driver');
  }
}

export async function deleteDriver(req: AuthRequest, res: Response) {
  try {
    const { eventId, driverId } = req.params;
    await transportService.deleteDriver(eventId, driverId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, 'Delete transport driver');
  }
}

export async function addPassenger(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { eventId, driverId } = req.params;
    const targetUserId =
      typeof req.body?.user_id === 'string' ? req.body.user_id : undefined;
    const passenger = await transportService.addPassenger(
      eventId,
      driverId,
      userId,
      targetUserId,
    );
    return res.status(201).json({ message: 'Passenger added', passenger });
  } catch (error) {
    return handleError(res, error, 'Add transport passenger');
  }
}

export async function removePassenger(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { eventId, driverId, passengerId } = req.params;
    await transportService.removePassenger(eventId, driverId, passengerId, userId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, 'Remove transport passenger');
  }
}
