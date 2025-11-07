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
): Promise<ExpensesByCategory[]> {
  const { data } = await httpClient.get<ExpensesByCategory[]>(
    '/analytics/expenses-by-category',
    {
      params: { month, year },
    },
  );

  return data;
}

