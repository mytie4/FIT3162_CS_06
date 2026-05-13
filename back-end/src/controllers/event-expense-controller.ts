import { Response } from 'express';
import * as eventExpenseService from '../services/event-expense.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateEventExpenseDTO, UpdateEventExpenseDTO } from '../entities/event-expense.entity';
import { ServiceError } from '../services/club.service';

export async function createEventExpense(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const dto: CreateEventExpenseDTO = req.body;
    const { eventId } = req.params;
    const eventExpense = await eventExpenseService.createEventExpense(eventId, dto, userId);
    return res.status(201).json({
      message: 'Event expense created successfully',
      eventExpense,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(
      'Create event expense failed:',
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExpensesByEventId(req: AuthRequest, res: Response) {
    try {
        const { eventId } = req.params;
        const eventExpense = await eventExpenseService.getExpensesByEventId(eventId);
        return res.status(200).json(eventExpense);
    } catch (error) {
        if (error instanceof ServiceError) {
        return res.status(error.statusCode).json({ error: error.message });
        }
        console.error(
            'Get expenses by event ID failed:',
            error instanceof Error ? error.message : error,
        );
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateEventExpense(req: AuthRequest, res: Response) {
    try {
        const { expenseId } = req.params;
        const dto: UpdateEventExpenseDTO = req.body;
        const updatedExpense = await eventExpenseService.updateEventExpense(expenseId, dto);
        return res.status(200).json({
            message: 'Event expense updated successfully',
            updatedExpense,
        });
    } catch (error) {
        if (error instanceof ServiceError) {
        return res.status(error.statusCode).json({ error: error.message });
        }
        console.error(
            'Update event expense failed:',
            error instanceof Error ? error.message : error,
        );
        return res.status(500).json({ error: 'Internal server error' });
    }
}