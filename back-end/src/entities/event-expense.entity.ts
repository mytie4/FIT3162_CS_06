export interface EventExpense {
  expense_id: string;
  event_id: string;
  item: string;
  category: string | null;
  amount: number;
  status: 'pending' | 'paid';
  date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateEventExpenseDTO {
  item: string;
  category?: string;
  amount: number;
  status?: 'pending' | 'paid';
  date?: string;
}

export interface UpdateEventExpenseDTO
  extends Partial<CreateEventExpenseDTO> {}