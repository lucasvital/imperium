import { httpClient } from '../httpClient';

export interface MentoradoAnalytics {
  userId: string;
  userName: string;
  userEmail: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalBalance: number;
  transactionsCount: number;
  accountsCount: number;
}

export interface GetMentoradosAnalyticsParams {
  month: number;
  year: number;
}

type MentoradosAnalyticsResponse = Array<MentoradoAnalytics>;

export async function getMentoradosAnalytics(params: GetMentoradosAnalyticsParams) {
  const { data } = await httpClient.get<MentoradosAnalyticsResponse>('/users/analytics/mentorados', {
    params
  });

  return data;
}


