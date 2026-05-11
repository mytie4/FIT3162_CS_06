import pool from "../db";
import {
  EventExpense,
  CreateEventExpenseDTO,
  UpdateEventExpenseDTO,
} from "../entities/event-expense.entity";

export async function createEventExpense(
  eventId: string,
  dto: CreateEventExpenseDTO,
  createdBy: string
): Promise<EventExpense> {
    const result = await pool.query(
    `INSERT INTO "Event_Expenses"
      (
        event_id,
        item,
        category,
        amount,
        status,
        date,
        created_by
      )
     VALUES
      ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      eventId,
      dto.item,
      dto.category ?? null,
      dto.amount,
      dto.status ?? "pending",
      dto.date ?? null,
      createdBy,
    ],
  );

  return result.rows[0];
}

export async function getExpensesByEventId(eventId: string): Promise<EventExpense[]> {
  const result = await pool.query(
    `SELECT * 
    FROM "Event_Expenses" 
    WHERE event_id = $1
    ORDER BY created_at DESC`,
    [eventId]
  );

  return result.rows;
}

export async function updateEventExpense(
  expenseId: string,
  dto: UpdateEventExpenseDTO
): Promise<EventExpense | null> {
  const allowedFields: Record<string, string> = {
    item: "item",
    category: "category",
    amount: "amount",
    status: "status",
    date: "date",
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, column] of Object.entries(allowedFields)) {
    if (key in dto) {
      setClauses.push(`"${column}" = $${paramIndex}`);
      values.push((dto as Record<string, unknown>)[key] ?? null);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) return null;
  
  values.push(expenseId);

  const result = await pool.query(
    `UPDATE "Event_Expenses"
     SET ${setClauses.join(", ")}
     WHERE expense_id = $${paramIndex}
     RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;    
}
