import { httpClient } from '../httpClient';
import { Budget } from '../../entities/budget';

export interface UpdateBudgetParams {
  id: string;
  limit: number;
}

export async function update({ id, limit }: UpdateBudgetParams) {
  const { data } = await httpClient.put<Budget>(`/budgets/${id}`, { limit });

  return data;
}


