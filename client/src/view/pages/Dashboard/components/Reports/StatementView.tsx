import { useMemo, useState } from 'react';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useTransactions } from '../../../../../shared/hooks/useTransactions';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { BR_MONTHS, EN_MONTHS } from '../../../../../shared/config/constants/months';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Spinner } from '../../../../components/Spinner';
import { CategoryIcon } from '../../../../components/icons/categories/CategoryIcon';
import { Transaction } from '../../../../../shared/entities/transaction';

interface DayGroup {
  date: Date;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

export function StatementView() {
  const { t, currentLanguage, selectedMentoradoId } = useDashboard();
  const [referenceDate, setReferenceDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();

  const { transactions, isLoading } = useTransactions({
    month,
    year,
    targetUserId: selectedMentoradoId || undefined,
  });

  const monthTotals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'INCOME') {
          acc.income += transaction.value;
        } else {
          acc.expense += transaction.value;
        }

        acc.balance = acc.income - acc.expense;

        return acc;
      },
      { income: 0, expense: 0, balance: 0 },
    );
  }, [transactions]);

  const dayGroups = useMemo<DayGroup[]>(() => {
    const groups = new Map<string, DayGroup>();

    transactions.forEach((transaction) => {
      const dateObj = new Date(transaction.date);
      const key = dateObj.toISOString().slice(0, 10);

      if (!groups.has(key)) {
        groups.set(key, {
          date: dateObj,
          transactions: [],
          totalIncome: 0,
          totalExpense: 0,
        });
      }

      const group = groups.get(key)!;
      group.transactions.push(transaction);

      if (transaction.type === 'INCOME') {
        group.totalIncome += transaction.value;
      } else {
        group.totalExpense += transaction.value;
      }
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        transactions: group.transactions.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  const handleChangeMonth = (offset: number) => {
    setReferenceDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      return next;
    });
  };

  const MONTHS = currentLanguage === 'pt' ? BR_MONTHS : EN_MONTHS;
  const locale = currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
  const monthLabel = `${MONTHS[month]} ${year}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('reports.statementTitle')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('reports.statementSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => handleChangeMonth(-1)}
            aria-label={t('reports.previousMonth')}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => handleChangeMonth(1)}
            aria-label={t('reports.nextMonth')}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/40">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">
            {t('reports.totalIncome')}
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(monthTotals.income, t)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/40">
          <p className="text-sm text-red-700 dark:text-red-300 mb-1">
            {t('reports.totalExpenses')}
          </p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">
            {formatCurrency(monthTotals.expense, t)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
            {t('reports.balance')}
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(monthTotals.balance, t)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          {t('reports.statementEmpty')}
        </div>
      ) : (
        <div className="space-y-6">
          {dayGroups.map((group) => {
            const headerLabel = group.date.toLocaleDateString(locale, {
              day: '2-digit',
              month: 'long',
              weekday: 'short',
            });

            const dayBalance = group.totalIncome - group.totalExpense;

            return (
              <div
                key={group.date.toISOString()}
                className="bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {headerLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      + {formatCurrency(group.totalIncome, t)}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      - {formatCurrency(group.totalExpense, t)}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">
                      {t('reports.balance')}:{' '}
                      {formatCurrency(dayBalance, t)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.transactions.map((transaction) => {
                    const transactionDate = new Date(transaction.date);
                    const timeLabel = transactionDate.toLocaleTimeString(
                      locale,
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    );

                    const isIncome = transaction.type === 'INCOME';
                    const valueColor = isIncome
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400';

                    const categoryName =
                      transaction.category?.name ||
                      (transaction.type === 'TRANSFER'
                        ? t('transactions.transfer')
                        : t('transactions.uncategorized'));

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-900/20 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CategoryIcon
                            type={isIncome ? 'income' : 'expense'}
                            category={transaction.category}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {transaction.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {categoryName} • {timeLabel}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${valueColor}`}>
                            {isIncome ? '+' : '-'}
                            {formatCurrency(transaction.value, t)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


