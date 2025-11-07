import { BankAccount } from '../../entities/bankAccount';
import { httpClient } from '../httpClient';

type BankAccountsResponse = Array<BankAccount>;

export async function getAll(targetUserId?: string) {
  const { data } = await httpClient.get<BankAccountsResponse>('/bank-accounts', {
    params: {
      targetUserId
    }
  });

  return data;
}
