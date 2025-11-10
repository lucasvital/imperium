import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../../shared/services/usersService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useTransactions } from '../../../shared/hooks/useTransactions';
import { useBankAccounts } from '../../../shared/hooks/useBankAccounts';
import { useMemo, useState, useCallback } from 'react';
import { useBudgets } from '../../../shared/hooks/useBudgets';

type TrendDirection = 'up' | 'down' | 'flat';
type TrendImpact = 'positive' | 'negative' | 'neutral';

interface TrendInfo {
  direction: TrendDirection;
  diff: number;
  percentage: number | null;
  impact: TrendImpact;
  previousValue: number | null;
}

type InsightData =
  | { type: 'balance'; balance: number }
  | { type: 'expenseTrend'; diff: number; percentage: number | null }
  | { type: 'incomeTrend'; diff: number; percentage: number | null }
  | { type: 'topCategory'; category: string; total: number }
  | { type: 'averageTicket'; value: number };

type SummaryCardType = 'currency' | 'number';

interface SummaryCard {
  id: 'income' | 'expense' | 'balance' | 'transactions';
  titleKey: string;
  type: SummaryCardType;
  value: number;
  trend: TrendInfo | null;
}

interface CashflowPoint {
  date: number;
  balance: number;
  income: number;
  expense: number;
}

export function useMentoradoDetailsController(mentoradoId: string) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const currentDate = new Date();
  const [filters, setFilters] = useState({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear()
  });

  // Buscar mentorados para encontrar o mentorado específico
  const { data: mentorados = [] } = useQuery({
    queryKey: ['mentorados'],
    queryFn: () => usersService.getMentorados(),
    enabled: isAdmin,
  });

  const mentorado = mentorados.find(m => m.id === mentoradoId);

  // Buscar analytics do mentorado
  const { data: analyticsData = [] } = useQuery({
    queryKey: ['mentorados-analytics', filters.month, filters.year],
    queryFn: () =>
      usersService.getMentoradosAnalytics({
        month: filters.month,
        year: filters.year
      }),
    enabled: isAdmin && !!mentoradoId
  });

  const analytics = analyticsData.find(a => a.userId === mentoradoId);

  const previousPeriod = useMemo(() => {
    const isJanuary = filters.month === 0;
    return {
      month: isJanuary ? 11 : filters.month - 1,
      year: isJanuary ? filters.year - 1 : filters.year
    };
  }, [filters.month, filters.year]);

  const { data: previousAnalyticsData = [] } = useQuery({
    queryKey: [
      'mentorados-analytics',
      previousPeriod.month,
      previousPeriod.year
    ],
    queryFn: () =>
      usersService.getMentoradosAnalytics({
        month: previousPeriod.month,
        year: previousPeriod.year
      }),
    enabled: isAdmin && !!mentoradoId
  });

  const previousAnalytics = previousAnalyticsData.find(
    a => a.userId === mentoradoId
  );

  // Buscar transações do mentorado
  const { transactions = [], isLoading: isLoadingTransactions } = useTransactions({
    ...filters,
    targetUserId: mentoradoId
  });

  // Buscar contas do mentorado
  const { accounts = [] } = useBankAccounts(mentoradoId);

  const { budgets = [], isLoading: isLoadingBudgets } = useBudgets(
    filters.month,
    filters.year,
    mentoradoId
  );

  const goToPreviousMonth = useCallback(() => {
    setFilters((prev) => {
      const isJanuary = prev.month === 0;
      return {
        month: isJanuary ? 11 : prev.month - 1,
        year: isJanuary ? prev.year - 1 : prev.year
      };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setFilters((prev) => {
      const isDecember = prev.month === 11;
      return {
        month: isDecember ? 0 : prev.month + 1,
        year: isDecember ? prev.year + 1 : prev.year
      };
    });
  }, []);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    const buildTrend = (
      currentValue?: number,
      previousValue?: number | null,
      invertImpact = false
    ): TrendInfo | null => {
      if (
        currentValue === undefined ||
        previousValue === undefined ||
        previousValue === null
      ) {
        return null;
      }

      const diff = currentValue - previousValue;
      const direction: TrendDirection =
        diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
      const percentage =
        previousValue === 0 ? null : (diff / previousValue) * 100;

      let impact: TrendImpact = 'neutral';
      if (direction !== 'flat') {
        const positiveMovement = direction === 'up';
        const effectivePositive = invertImpact
          ? !positiveMovement
          : positiveMovement;
        impact = effectivePositive ? 'positive' : 'negative';
      }

      return {
        direction,
        diff,
        percentage,
        impact,
        previousValue
      };
    };

    const income = analytics?.totalIncome ?? 0;
    const expense = analytics?.totalExpense ?? 0;
    const balance = analytics?.balance ?? 0;
    const transactionsCount = analytics?.transactionsCount ?? 0;

    return [
      {
        id: 'income',
        titleKey: 'menteeDetails.summary.income',
        type: 'currency',
        value: income,
        trend: buildTrend(
          analytics?.totalIncome,
          previousAnalytics?.totalIncome
        )
      },
      {
        id: 'expense',
        titleKey: 'menteeDetails.summary.expense',
        type: 'currency',
        value: expense,
        trend: buildTrend(
          analytics?.totalExpense,
          previousAnalytics?.totalExpense,
          true
        )
      },
      {
        id: 'balance',
        titleKey: 'menteeDetails.summary.balance',
        type: 'currency',
        value: balance,
        trend: buildTrend(
          analytics?.balance,
          previousAnalytics?.balance
        )
      },
      {
        id: 'transactions',
        titleKey: 'menteeDetails.summary.transactions',
        type: 'number',
        value: transactionsCount,
        trend: buildTrend(
          analytics?.transactionsCount,
          previousAnalytics?.transactionsCount
        )
      }
    ];
  }, [analytics, previousAnalytics]);

  const insights = useMemo<InsightData[]>(() => {
    const cardsById = summaryCards.reduce<Record<string, SummaryCard>>(
      (acc, card) => {
        acc[card.id] = card;
        return acc;
      },
      {}
    );

    const expenseTransactions = transactions.filter(
      transaction => transaction.type === 'EXPENSE'
    );

    const categoryTotals = expenseTransactions.reduce<
      Record<string, { name: string; total: number }>
    >((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Sem categoria';
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, total: 0 };
      }
      acc[categoryName].total += transaction.value;
      return acc;
    }, {});

    const topCategory = Object.values(categoryTotals).sort(
      (a, b) => b.total - a.total
    )[0];

    const totalAbsoluteValue = transactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.value),
      0
    );
    const averageTicket =
      transactions.length > 0 ? totalAbsoluteValue / transactions.length : null;

    const list: InsightData[] = [];

    list.push({
      type: 'balance',
      balance: analytics?.balance ?? 0
    });

    const incomeTrend = cardsById.income?.trend;
    if (incomeTrend && incomeTrend.direction !== 'flat') {
      list.push({
        type: 'incomeTrend',
        diff: incomeTrend.diff,
        percentage: incomeTrend.percentage
      });
    }

    const expenseTrend = cardsById.expense?.trend;
    if (expenseTrend && expenseTrend.direction !== 'flat') {
      list.push({
        type: 'expenseTrend',
        diff: expenseTrend.diff,
        percentage: expenseTrend.percentage
      });
    }

    if (topCategory) {
      list.push({
        type: 'topCategory',
        category: topCategory.name,
        total: topCategory.total
      });
    }

    if (averageTicket && transactions.length >= 3) {
      list.push({
        type: 'averageTicket',
        value: averageTicket
      });
    }

    return list;
  }, [analytics, summaryCards, transactions]);

  const cashflowSeries = useMemo<CashflowPoint[]>(() => {
    if (!transactions.length) {
      return [];
    }

    const sortedTransactions = [...transactions]
      .filter((transaction) => transaction.type !== 'TRANSFER')
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    const dailyMap = new Map<
      string,
      { date: Date; income: number; expense: number }
    >();

    sortedTransactions.forEach((transaction) => {
      const dateObj = new Date(transaction.date);
      const key = dateObj.toISOString().slice(0, 10);
      if (!dailyMap.has(key)) {
        dailyMap.set(key, { date: dateObj, income: 0, expense: 0 });
      }
      const entry = dailyMap.get(key)!;

      if (transaction.type === 'INCOME') {
        entry.income += transaction.value;
      }
      if (transaction.type === 'EXPENSE') {
        entry.expense += transaction.value;
      }
    });

    const ordered = Array.from(dailyMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    let runningBalance = 0;
    return ordered.map((entry) => {
      runningBalance += entry.income - entry.expense;
      return {
        date: entry.date.getTime(),
        income: entry.income,
        expense: entry.expense,
        balance: runningBalance
      };
    });
  }, [transactions]);

  return {
    mentorado,
    analytics,
    transactions,
    accounts,
    isLoading: (!mentorado && isAdmin) || isLoadingTransactions,
    filters,
    setFilters,
    summaryCards,
    insights,
    budgets,
    isLoadingBudgets,
    goToPreviousMonth,
    goToNextMonth,
    cashflowSeries
  };
}

