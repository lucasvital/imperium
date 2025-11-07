import { httpClient } from '../httpClient';
import { Budget } from '../../entities/budget';

export interface CreateBudgetParams {
  month: number;
  year: number;
  limit: number;
  categoryId?: string;
}

export async function create(budgetData: CreateBudgetParams) {
  const { data } = await httpClient.post<Budget>('/budgets', budgetData);

  return data;
}


