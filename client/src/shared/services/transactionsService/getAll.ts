import { Transaction } from '../../entities/transaction';
import { httpClient } from '../httpClient';

type TransactionsResponse = Array<Transaction>;

export type TransactionsFilters = {
  month: number;

  year: number;

  bankAccountId?: string;

  type?: Transaction['type'];

  targetUserId?: string;

  name?: string;

  minValue?: number;

  maxValue?: number;

  categoryIds?: string[];

  startDate?: string;

  endDate?: string;
};

export async function getAll(filters: TransactionsFilters) {
  const params: any = {
    month: filters.month,
    year: filters.year,
    type: filters.type,
    bankAccountId: filters.bankAccountId,
    targetUserId: filters.targetUserId,
  };

  if (filters.name) {
    params.name = filters.name;
  }

  if (filters.minValue !== undefined) {
    params.minValue = filters.minValue;
  }

  if (filters.maxValue !== undefined) {
    params.maxValue = filters.maxValue;
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    params.categoryIds = filters.categoryIds;
  }

  if (filters.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  const { data } = await httpClient.get<TransactionsResponse>('/transactions', {
    params,
  });

  return data;
}
