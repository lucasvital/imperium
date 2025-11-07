import { httpClient } from '../httpClient';

export interface IncomeByCategory {
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

export async function getIncomeByCategory(
  month: number,
  year: number,
): Promise<IncomeByCategory[]> {
  const { data } = await httpClient.get<IncomeByCategory[]>(
    '/analytics/income-by-category',
    {
      params: { month, year },
    },
  );

  return data;
}

