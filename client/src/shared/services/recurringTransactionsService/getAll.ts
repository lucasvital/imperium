import { httpClient } from '../httpClient';
import { RecurringTransaction } from '../../entities/recurringTransaction';

export async function getAll(): Promise<RecurringTransaction[]> {
  const { data } = await httpClient.get<RecurringTransaction[]>(
    '/recurring-transactions',
  );

  return data;
}

