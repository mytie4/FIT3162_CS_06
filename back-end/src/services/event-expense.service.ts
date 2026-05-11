import * as eventRepo from '../repositories/event.repository';
import * as eventExpenseRepo from '../repositories/event-expense.repository';
import { CreateEventExpenseDTO, UpdateEventExpenseDTO } from '../entities/event-expense.entity';
import { ServiceError } from './club.service';

export async function createEventExpense(
  eventId: string,
  dto: CreateEventExpenseDTO,
  userId: string,
) {
  if (!userId) {
    throw new ServiceError(401, 'Unauthorized. User ID is required.');
  }

  if (!eventId) {
    throw new ServiceError(400, 'Event ID is required.');
  }

  if (dto.item === undefined) {
    throw new ServiceError(400, 'Expense item name is required.');
  }

  if (dto.amount === undefined) {
    throw new ServiceError(400, 'Expense amount is required.');
  }

  // Validate event exists
  const event = await eventRepo.getEventById(eventId);
  if (!event) {
    throw new ServiceError(404, 'Event not found.');
  }

  const sanitizedDTO = sanitizeAndValidateEventExpenseDTO(dto) as CreateEventExpenseDTO;

  const createdExpense = await eventExpenseRepo.createEventExpense(eventId, sanitizedDTO, userId);
  
  return createdExpense;
}

export async function getExpensesByEventId(eventId: string) {
  if (!eventId) {
    throw new ServiceError(400, 'Event ID is required.');
  }

  // Validate event exists
  const event = await eventRepo.getEventById(eventId);
  if (!event) {
    throw new ServiceError(404, 'Event not found.');
  }

  const expenses = await eventExpenseRepo.getExpensesByEventId(eventId);

  const spent = expenses.reduce(
    (total, expense) => 
        total + Number(expense.amount),
    0
  );

  const totalBudget = Number(event.budget ?? 0);

  return { 
    expenses, 
    summary: {
        total_budget: totalBudget,
        total_spent: spent,
        remaining_budget: totalBudget - spent,
    } 
  };
}

export async function updateEventExpense(
  expenseId: string,
  dto: UpdateEventExpenseDTO
) {
  if (!expenseId) {
    throw new ServiceError(400, 'Expense ID is required.');
  }

  if (Object.keys(dto).length === 0) {
    throw new ServiceError(400, 'At least one field must be provided for update.');
  }

  const sanitizedDTO = sanitizeAndValidateEventExpenseDTO(dto) as UpdateEventExpenseDTO;

  const updatedExpense = await eventExpenseRepo.updateEventExpense(expenseId, sanitizedDTO);
  if (!updatedExpense) {
    throw new ServiceError(404, 'Expense not found.');
  }

  return updatedExpense;
}

function sanitizeAndValidateEventExpenseDTO(dto: CreateEventExpenseDTO | UpdateEventExpenseDTO): 
CreateEventExpenseDTO | UpdateEventExpenseDTO {
    const cleaned: CreateEventExpenseDTO | UpdateEventExpenseDTO = {...dto};

    if (cleaned.item !== undefined) {
        if (typeof cleaned.item !== 'string') {
            throw new ServiceError(400, 'Expense item name must be a string.');
        }

        cleaned.item = cleaned.item.trim();

        if (!cleaned.item) {
            throw new ServiceError(400, 'Expense item name cannot be empty.');
        }

        if (cleaned.item.length > 100) {
            throw new ServiceError(400, 'Expense item name cannot exceed 100 characters.');
        }
    }

    if (cleaned.category !== undefined) {
        if (typeof cleaned.category !== 'string') {
            throw new ServiceError(400, 'Expense category must be a string.');
        }

        cleaned.category = cleaned.category.trim();
        
        if (!cleaned.category) {
            throw new ServiceError(400, 'Expense category cannot be empty.');
        }

        if (cleaned.category.length > 100) {
            throw new ServiceError(400, 'Expense category cannot exceed 100 characters.');
        }
    }

    if (cleaned.amount !== undefined) {
        if (typeof cleaned.amount !== 'number' || cleaned.amount <= 0) {
            throw new ServiceError(400, 'Expense amount must be a positive number.');
        }
    }

    if (cleaned.status !== undefined) {
        const VALID_STATUSES = ['pending', 'paid'];
        if (!VALID_STATUSES.includes(cleaned.status)) {
            throw new ServiceError(400, `Expense status must be one of: ${VALID_STATUSES.join(', ')}.`);
        }
    }

    if (cleaned.date !== undefined && isNaN(Date.parse(cleaned.date))) {
        throw new ServiceError(400, 'Valid expense date is required.');
    }

    return cleaned;
}