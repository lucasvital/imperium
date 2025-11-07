import { httpClient } from '../httpClient';

export async function remove(recurringTransactionId: string): Promise<void> {
  await httpClient.delete(`/recurring-transactions/${recurringTransactionId}`);
}

