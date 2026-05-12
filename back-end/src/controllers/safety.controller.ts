import { Response } from 'express';
import * as safetyService from '../services/safety.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  CreateEmergencyContactDTO,
  CreateSafetyCheckDTO,
  UpdateEmergencyContactDTO,
  UpdateSafetyCheckDTO,
} from '../entities/safety.entity';
import { ServiceError } from '../services/club.service';

function handleError(res: Response, error: unknown, context: string) {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(`${context} failed:`, error instanceof Error ? error.message : error);
  return res.status(500).json({ error: 'Internal server error' });
}

// ---- Safety Checks ---------------------------------------------------------

export async function getSafetyChecks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { eventId } = req.params;
    const checks = await safetyService.getSafetyChecks(eventId, userId);
    return res.status(200).json(checks);
  } catch (error) {
    return handleError(res, error, 'Get safety checks');
  }
}

export async function createSafetyCheck(req: AuthRequest, res: Response) {
  try {
    const { eventId } = req.params;
    const dto: CreateSafetyCheckDTO = req.body ?? {};
    const check = await safetyService.createSafetyCheck(eventId, dto);
    return res.status(201).json({ message: 'Safety check created', check });
  } catch (error) {
    return handleError(res, error, 'Create safety check');
  }
}

export async function updateSafetyCheck(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { eventId, checkId } = req.params;
    const dto: UpdateSafetyCheckDTO = req.body ?? {};
    const check = await safetyService.updateSafetyCheck(eventId, checkId, dto, userId);
    return res.status(200).json({ message: 'Safety check updated', check });
  } catch (error) {
    return handleError(res, error, 'Update safety check');
  }
}

export async function deleteSafetyCheck(req: AuthRequest, res: Response) {
  try {
    const { eventId, checkId } = req.params;
    await safetyService.deleteSafetyCheck(eventId, checkId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, 'Delete safety check');
  }
}

// ---- Emergency Contacts ----------------------------------------------------

export async function getEmergencyContacts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { eventId } = req.params;
    const contacts = await safetyService.getEmergencyContacts(eventId, userId);
    return res.status(200).json(contacts);
  } catch (error) {
    return handleError(res, error, 'Get emergency contacts');
  }
}

export async function createEmergencyContact(req: AuthRequest, res: Response) {
  try {
    const { eventId } = req.params;
    const dto: CreateEmergencyContactDTO = req.body ?? {};
    const contact = await safetyService.createEmergencyContact(eventId, dto);
    return res.status(201).json({ message: 'Emergency contact created', contact });
  } catch (error) {
    return handleError(res, error, 'Create emergency contact');
  }
}

export async function updateEmergencyContact(req: AuthRequest, res: Response) {
  try {
    const { eventId, contactId } = req.params;
    const dto: UpdateEmergencyContactDTO = req.body ?? {};
    const contact = await safetyService.updateEmergencyContact(eventId, contactId, dto);
    return res.status(200).json({ message: 'Emergency contact updated', contact });
  } catch (error) {
    return handleError(res, error, 'Update emergency contact');
  }
}

export async function deleteEmergencyContact(req: AuthRequest, res: Response) {
  try {
    const { eventId, contactId } = req.params;
    await safetyService.deleteEmergencyContact(eventId, contactId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, 'Delete emergency contact');
  }
}
