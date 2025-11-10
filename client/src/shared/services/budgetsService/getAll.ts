import { httpClient } from '../httpClient';
import { Budget } from '../../entities/budget';

export interface GetAllBudgetsParams {
  month: number;
  year: number;
  targetUserId?: string;
}

export async function getAll(params: GetAllBudgetsParams) {
  const queryParams: Record<string, unknown> = {
    month: params.month,
    year: params.year,
  };

  if (params.targetUserId) {
    queryParams.targetUserId = params.targetUserId;
  }

  const { data } = await httpClient.get<Budget[]>('/budgets', {
    params: queryParams,
  });

  return data;
}


