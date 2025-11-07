import { getExpensesByCategory } from './getExpensesByCategory';
import { getIncomeByCategory } from './getIncomeByCategory';
import { getMonthlyTrend } from './getMonthlyTrend';
import { getYearlySummary } from './getYearlySummary';

export const analyticsService = {
  getExpensesByCategory,
  getIncomeByCategory,
  getMonthlyTrend,
  getYearlySummary,
};

