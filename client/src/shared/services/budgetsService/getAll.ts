import { httpClient } from '../httpClient';
import { Budget } from '../../entities/budget';

export interface GetAllBudgetsParams {
  month: number;
  year: number;
}

export async function getAll(params: GetAllBudgetsParams) {
  const { data } = await httpClient.get<Budget[]>('/budgets', {
    params,
  });

  return data;
}


