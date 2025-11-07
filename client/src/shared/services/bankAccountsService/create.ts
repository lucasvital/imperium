import { httpClient } from '../httpClient';

export interface CreateBankAccountParams {
  name: string;

  initialBalance: number;

  color: string;

  type: 'CASH' | 'INVESTMENT' | 'CHECKING';

  targetUserId?: string;
}

export async function create(bankAccountData: CreateBankAccountParams) {
  const { targetUserId, ...data } = bankAccountData;
  const params = targetUserId ? { targetUserId } : {};
  const { data: response } = await httpClient.post('/bank-accounts', data, { params });

  return response;
}
