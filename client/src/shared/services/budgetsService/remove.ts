import { httpClient } from '../httpClient';

export async function remove(budgetId: string) {
  await httpClient.delete(`/budgets/${budgetId}`);
}


