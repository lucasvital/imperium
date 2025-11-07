import { httpClient } from '../httpClient';

export interface MonthlyTrendData {
  month: number;
  total: number;
}

export async function getMonthlyTrend(
  year: number,
  type?: 'INCOME' | 'EXPENSE',
): Promise<MonthlyTrendData[]> {
  const { data } = await httpClient.get<MonthlyTrendData[]>(
    '/analytics/monthly-trend',
    {
      params: { year, type },
    },
  );

  return data;
}

