import { httpClient } from '../httpClient';

export interface CreateTransactionParams {
  bankAccountId: string;

  categoryId?: string;

  name: string;

  value: number;

  date: string;

  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';

  targetUserId?: string;

  toBankAccountId?: string;

  installments?: number;

  totalValue?: number;

  firstInstallmentDate?: string;
}

export async function create(transactionData: CreateTransactionParams) {
  const { targetUserId, ...data } = transactionData;
  const params = targetUserId ? { targetUserId } : {};
  const { data: response } = await httpClient.post('/transactions', data, { params });

  return response;
}
