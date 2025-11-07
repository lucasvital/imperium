import { httpClient } from '../httpClient';
import { RecurringTransaction } from '../../entities/recurringTransaction';
import { CreateRecurringTransactionParams } from './create';

export interface UpdateRecurringTransactionParams
  extends CreateRecurringTransactionParams {
  id: string;
}

export async function update(
  params: UpdateRecurringTransactionParams,
): Promise<RecurringTransaction> {
  const { id, ...data } = params;
  const response = await httpClient.put<RecurringTransaction>(
    `/recurring-transactions/${id}`,
    data,
  );

  return response.data;
}

