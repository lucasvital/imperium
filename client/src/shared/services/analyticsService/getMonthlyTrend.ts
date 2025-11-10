import { httpClient } from '../httpClient';

export interface MonthlyTrendData {
  month: number;
  total: number;
}

export async function getMonthlyTrend(
  year: number,
  type?: 'INCOME' | 'EXPENSE',
  targetUserId?: string,
): Promise<MonthlyTrendData[]> {
  const params: Record<string, unknown> = { year };

  if (type) {
    params.type = type;
  }

  if (targetUserId) {
    params.targetUserId = targetUserId;
  }

  const { data } = await httpClient.get<MonthlyTrendData[]>(
    '/analytics/monthly-trend',
    {
      params,
    },
  );

  return data;
}

