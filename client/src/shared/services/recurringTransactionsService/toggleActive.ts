import { httpClient } from '../httpClient';
import { RecurringTransaction } from '../../entities/recurringTransaction';

export async function toggleActive(
  recurringTransactionId: string,
): Promise<RecurringTransaction> {
  const { data } = await httpClient.patch<RecurringTransaction>(
    `/recurring-transactions/${recurringTransactionId}/toggle-active`,
  );

  return data;
}

