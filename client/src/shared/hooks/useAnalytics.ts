import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

interface UseMonthlyParams {
  month: number;
  year: number;
  targetUserId?: string;
}

interface UseYearParams {
  year: number;
  targetUserId?: string;
}

interface UseMonthlyTrendParams extends UseYearParams {
  type?: 'INCOME' | 'EXPENSE';
}

export function useExpensesByCategory({
  month,
  year,
  targetUserId,
}: UseMonthlyParams) {
  return useQuery({
    queryKey: ['analytics', 'expenses-by-category', month, year, targetUserId],
    queryFn: () =>
      analyticsService.getExpensesByCategory(month, year, targetUserId),
  });
}

export function useIncomeByCategory({
  month,
  year,
  targetUserId,
}: UseMonthlyParams) {
  return useQuery({
    queryKey: ['analytics', 'income-by-category', month, year, targetUserId],
    queryFn: () =>
      analyticsService.getIncomeByCategory(month, year, targetUserId),
  });
}

export function useMonthlyTrend({
  year,
  type,
  targetUserId,
}: UseMonthlyTrendParams) {
  return useQuery({
    queryKey: ['analytics', 'monthly-trend', year, type, targetUserId],
    queryFn: () => analyticsService.getMonthlyTrend(year, type, targetUserId),
  });
}

export function useYearlySummary({ year, targetUserId }: UseYearParams) {
  return useQuery({
    queryKey: ['analytics', 'yearly-summary', year, targetUserId],
    queryFn: () => analyticsService.getYearlySummary(year, targetUserId),
  });
}

