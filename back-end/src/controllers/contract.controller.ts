import { Response } from 'express';
import * as contractService from '../services/contract.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  CreateContractDTO,
  UpdateContractDTO,
} from '../entities/contract.entity';
import { ServiceError } from '../services/club.service';

function handleError(res: Response, error: unknown, context: string) {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`${context} failed:`, error instanceof Error ? error.message : error);
  return res.status(500).json({ error: 'Internal server error' });
}

export async function listContracts(req: AuthRequest, res: Response) {
  try {
    const { eventId } = req.params;
    const contracts = await contractService.listContracts(eventId);
    return res.status(200).json(contracts);
  } catch (error) {
    return handleError(res, error, 'List contracts');
  }
}

export async function createContract(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { eventId } = req.params;
    const dto: CreateContractDTO = req.body ?? {};
    const contract = await contractService.createContract(eventId, dto, userId);
    return res.status(201).json({ message: 'Contract created', contract });
  } catch (error) {
    return handleError(res, error, 'Create contract');
  }
}

export async function updateContract(req: AuthRequest, res: Response) {
  try {
    const { eventId, contractId } = req.params;
    const dto: UpdateContractDTO = req.body ?? {};
    const contract = await contractService.updateContract(eventId, contractId, dto);
    return res.status(200).json({ message: 'Contract updated', contract });
  } catch (error) {
    return handleError(res, error, 'Update contract');
  }
}

export async function deleteContract(req: AuthRequest, res: Response) {
  try {
    const { eventId, contractId } = req.params;
    await contractService.deleteContract(eventId, contractId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, 'Delete contract');
  }
}
