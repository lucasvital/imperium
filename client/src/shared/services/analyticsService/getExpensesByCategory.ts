import { httpClient } from '../httpClient';

export interface ExpensesByCategory {
  categoryId: string;
  categoryName: string;
  total: number;
  category?: {
    id: string;
    name: string;
    icon: string;
    iconKey?: string;
    iconUrl?: string;
  };
}

export async function getExpensesByCategory(
  month: number,
  year: number,
  targetUserId?: string,
): Promise<ExpensesByCategory[]> {
  const params: Record<string, unknown> = { month, year };

  if (targetUserId) {
    params.targetUserId = targetUserId;
  }

  const { data } = await httpClient.get<ExpensesByCategory[]>(
    '/analytics/expenses-by-category',
    {
      params,
    },
  );

  return data;
}

