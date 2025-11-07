import { httpClient } from '../httpClient';
import { RecurringTransaction } from '../../entities/recurringTransaction';

export interface CreateRecurringTransactionParams {
  name: string;
  value: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  bankAccountId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive?: boolean;
}

export async function create(
  params: CreateRecurringTransactionParams,
): Promise<RecurringTransaction> {
  const { data } = await httpClient.post<RecurringTransaction>(
    '/recurring-transactions',
    params,
  );

  return data;
}

