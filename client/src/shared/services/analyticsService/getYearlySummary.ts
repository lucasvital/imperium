import { httpClient } from '../httpClient';

export interface YearlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  year: number;
}

export async function getYearlySummary(
  year: number,
  targetUserId?: string,
): Promise<YearlySummary> {
  const params: Record<string, unknown> = { year };

  if (targetUserId) {
    params.targetUserId = targetUserId;
  }

  const { data } = await httpClient.get<YearlySummary>(
    '/analytics/yearly-summary',
    {
      params,
    },
  );

  return data;
}

