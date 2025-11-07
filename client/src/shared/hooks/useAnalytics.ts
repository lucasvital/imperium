import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export function useExpensesByCategory(month: number, year: number) {
  return useQuery({
    queryKey: ['analytics', 'expenses-by-category', month, year],
    queryFn: () => analyticsService.getExpensesByCategory(month, year),
  });
}

export function useIncomeByCategory(month: number, year: number) {
  return useQuery({
    queryKey: ['analytics', 'income-by-category', month, year],
    queryFn: () => analyticsService.getIncomeByCategory(month, year),
  });
}

export function useMonthlyTrend(year: number, type?: 'INCOME' | 'EXPENSE') {
  return useQuery({
    queryKey: ['analytics', 'monthly-trend', year, type],
    queryFn: () => analyticsService.getMonthlyTrend(year, type),
  });
}

export function useYearlySummary(year: number) {
  return useQuery({
    queryKey: ['analytics', 'yearly-summary', year],
    queryFn: () => analyticsService.getYearlySummary(year),
  });
}

