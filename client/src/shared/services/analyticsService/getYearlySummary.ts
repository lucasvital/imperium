import { httpClient } from '../httpClient';

export interface YearlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  year: number;
}

export async function getYearlySummary(year: number): Promise<YearlySummary> {
  const { data } = await httpClient.get<YearlySummary>(
    '/analytics/yearly-summary',
    {
      params: { year },
    },
  );

  return data;
}

