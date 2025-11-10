import { useParams, useNavigate } from 'react-router-dom';
import { useMentoradoDetailsController } from './useMentoradoDetailsController';
import { Logo } from '../../components/Logo';
import { Spinner } from '../../components/Spinner';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  LightningBoltIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@radix-ui/react-icons';
import { Button } from '../../components/Button';
import { Transaction } from '../../../shared/entities/transaction';
import { BankAccount } from '../../../shared/entities/bankAccount';
import { TFunction } from 'i18next';
import { CategoryIcon } from '../../components/icons/categories/CategoryIcon';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line
} from 'recharts';

function ExpensesByCategoryChart({ transactions, t }: { transactions: Transaction[]; t: TFunction }) {
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  
  const categoryTotals = expenses.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || 'Sem categoria';
    acc[categoryName] = (acc[categoryName] || 0) + transaction.value;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  const categories = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value, percentage: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma despesa para exibir
        </p>
      </div>
    );
  }

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="space-y-3">
      {categories.map((category, index) => (
        <div key={category.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {category.name}
            </span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {formatCurrency(category.value, t)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all shadow-sm"
              style={{
                width: `${category.percentage}%`,
                backgroundColor: colors[index % colors.length],
                opacity: 0.9
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MentoradoDetails() {
  const { mentoradoId } = useParams<{ mentoradoId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    mentorado,
    analytics,
    transactions,
    accounts,
    isLoading,
    summaryCards,
    insights,
    budgets,
    isLoadingBudgets,
    filters,
    goToPreviousMonth,
    goToNextMonth,
    cashflowSeries
  } = useMentoradoDetailsController(mentoradoId!);

  const trendColorMap = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400'
  } as const;

  const isPortuguese = i18n.language.startsWith('pt');
  const locale = isPortuguese ? 'pt-BR' : 'en-US';
  const currentPeriodLabel = new Date(
    filters.year,
    filters.month
  ).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric'
  });

  function formatValue(
    value: number,
    type: 'currency' | 'number',
    tFn: TFunction
  ) {
    if (type === 'currency') {
      return formatCurrency(value, tFn);
    }
    return value.toLocaleString(locale);
  }

  function renderTrend(
    type: 'currency' | 'number',
    trend:
      | {
          direction: 'up' | 'down' | 'flat';
          diff: number;
          percentage: number | null;
          impact: 'positive' | 'negative' | 'neutral';
        }
      | null,
    tFn: TFunction
  ) {
    if (!trend) {
      return (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {tFn('menteeDetails.trendNoData')}
        </span>
      );
    }

    if (trend.direction === 'flat' || trend.diff === 0) {
      return (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tFn('menteeDetails.trendNoChange')}
        </span>
      );
    }

    const Icon =
      trend.direction === 'up' ? ArrowUpIcon : trend.direction === 'down' ? ArrowDownIcon : MinusIcon;
    const diffText =
      type === 'currency'
        ? formatCurrency(Math.abs(trend.diff), tFn)
        : Math.abs(trend.diff).toLocaleString(locale);
    const percentageText =
      trend.percentage !== null
        ? ` (${Math.abs(trend.percentage).toFixed(1)}%)`
        : '';

    return (
      <span
        className={`flex items-center gap-1 text-xs font-medium ${trendColorMap[trend.impact]}`}
      >
        <Icon className="w-3 h-3" />
        {tFn('menteeDetails.trendLabel', {
          value: `${trend.diff > 0 ? '+' : '-'}${diffText}${percentageText}`
        })}
      </span>
    );
  }

  function renderInsightMessage(
    insight:
      | { type: 'balance'; balance: number }
      | { type: 'expenseTrend'; diff: number; percentage: number | null }
      | { type: 'incomeTrend'; diff: number; percentage: number | null }
      | { type: 'topCategory'; category: string; total: number }
      | { type: 'averageTicket'; value: number },
    tFn: TFunction
  ) {
    switch (insight.type) {
      case 'balance': {
        const balanceValue = formatCurrency(Math.abs(insight.balance), tFn);
        if (insight.balance < 0) {
          return tFn('menteeDetails.insightBalanceNegative', {
            value: balanceValue
          });
        }
        return tFn('menteeDetails.insightBalancePositive', {
          value: formatCurrency(insight.balance, tFn)
        });
      }
      case 'expenseTrend': {
        const diffText = formatCurrency(Math.abs(insight.diff), tFn);
        const percentageText =
          insight.percentage !== null
            ? ` (${Math.abs(insight.percentage).toFixed(1)}%)`
            : '';
        if (insight.diff > 0) {
          return tFn('menteeDetails.insightExpenseIncrease', {
            value: `${diffText}${percentageText}`
          });
        }
        return tFn('menteeDetails.insightExpenseDecrease', {
          value: `${diffText}${percentageText}`
        });
      }
      case 'incomeTrend': {
        const diffText = formatCurrency(Math.abs(insight.diff), tFn);
        const percentageText =
          insight.percentage !== null
            ? ` (${Math.abs(insight.percentage).toFixed(1)}%)`
            : '';
        if (insight.diff > 0) {
          return tFn('menteeDetails.insightIncomeIncrease', {
            value: `${diffText}${percentageText}`
          });
        }
        return tFn('menteeDetails.insightIncomeDecrease', {
          value: `${diffText}${percentageText}`
        });
      }
      case 'topCategory': {
        return tFn('menteeDetails.insightTopCategory', {
          category: insight.category,
          value: formatCurrency(insight.total, tFn)
        });
      }
      case 'averageTicket': {
        return tFn('menteeDetails.insightAverageTicket', {
          value: formatCurrency(insight.value, tFn)
        });
      }
      default:
        return '';
    }
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  if (!mentorado) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Mentorado não encontrado
        </p>
        <Button onClick={() => navigate('/')}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex flex-col gap-4 p-4 md:px-8 md:py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-teal-900 dark:text-white hover:opacity-80"
            >
              <Logo className="h-14" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>{t('menteeDetails.backLabel')}</span>
            </button>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-teal-900 dark:text-white">
                {mentorado.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mentorado.email}
              </p>
            </div>
          </div>
          {mentorado.mentorPermission && (
            <span className={`px-4 py-2 text-xs rounded-full font-medium ${
              mentorado.mentorPermission === 'READ_ONLY'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {mentorado.mentorPermission === 'READ_ONLY' ? t('menteeDetails.readOnlyTag') : t('menteeDetails.fullAccessTag')}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('menteeDetails.periodHint')}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={t('reports.previousMonth')}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[160px] text-center capitalize">
              {currentPeriodLabel}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={t('reports.nextMonth')}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:px-8 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map(card => (
              <div
                key={card.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t(card.titleKey)}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      card.id === 'balance'
                        ? (card.value ?? 0) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        : card.id === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : card.id === 'expense'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {formatValue(card.value, card.type, t)}
                  </p>
                </div>
                {renderTrend(card.type, card.trend, t)}
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <LightningBoltIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('menteeDetails.insightsTitle')}
              </h2>
            </div>
            <div className="space-y-3">
              {insights.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('menteeDetails.insightEmpty')}
                </p>
              ) : (
                insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0">
                      <LightningBoltIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-1" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {renderInsightMessage(insight, t)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Planejamentos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('menteeDetails.budgetsTitle')}
              </h2>
            </div>
            {isLoadingBudgets ? (
              <div className="flex justify-center py-12">
                <Spinner className="w-8 h-8" />
              </div>
            ) : budgets.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('menteeDetails.budgetsEmpty')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((budget) => {
                  const isIncome = budget.isIncome;
                  const percentage = budget.percentage ?? 0;
                  const remainingValue = budget.remaining ?? 0;
                  const statusKey = isIncome
                    ? percentage >= 100
                      ? 'menteeDetails.budgetStatus.goalReached'
                      : percentage >= 80
                      ? 'menteeDetails.budgetStatus.nearGoalIncome'
                      : 'menteeDetails.budgetStatus.onTrackIncome'
                    : percentage > 100
                    ? 'menteeDetails.budgetStatus.overLimit'
                    : percentage >= 80
                    ? 'menteeDetails.budgetStatus.nearLimit'
                    : 'menteeDetails.budgetStatus.onTrack';

                  const progressColor = isIncome
                    ? percentage >= 100
                      ? 'bg-green-500'
                      : percentage >= 80
                      ? 'bg-blue-500'
                      : 'bg-teal-500'
                    : percentage > 100
                    ? 'bg-red-500'
                    : percentage >= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500';

                  const limitLabel = isIncome
                    ? t('menteeDetails.budgetGoalLabel')
                    : t('menteeDetails.budgetLimitLabel');

                  const secondaryLabelKey = isIncome
                    ? remainingValue >= 0
                      ? 'menteeDetails.aboveGoalLabel'
                      : 'menteeDetails.toGoalLabel'
                    : remainingValue >= 0
                    ? 'menteeDetails.remainingLabel'
                    : 'menteeDetails.overLimitLabel';

                  return (
                    <div
                      key={budget.id}
                      className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex flex-col gap-3"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {budget.category?.name ||
                            t('menteeDetails.generalBudgetLabel')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {limitLabel}: {formatCurrency(budget.limit, t)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {isIncome
                            ? t('menteeDetails.receivedLabel')
                            : t('menteeDetails.spentLabel')}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(budget.spent ?? 0, t)}
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all`}
                          style={{
                            width: `${Math.min(100, Math.max(0, percentage))}%`
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('menteeDetails.progressLabel', {
                            value: `${percentage.toFixed(1)}%`
                          })}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t(secondaryLabelKey, {
                            value: formatCurrency(
                              Math.abs(remainingValue),
                              t
                            )
                          })}
                        </span>
                      </div>

                      <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                        {t(statusKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fluxo de Caixa */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t('menteeDetails.cashflowTitle')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('menteeDetails.cashflowSubtitle')}
              </p>
              {cashflowSeries.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  {t('menteeDetails.cashflowEmpty')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cashflowSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value: Date) =>
                        new Date(value).toLocaleDateString(locale, {
                          day: '2-digit'
                        })
                      }
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      scale="time"
                    />
                    <YAxis
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickFormatter={(value: number) =>
                        formatCurrency(value, t)
                      }
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const labelKey =
                          name === 'balance'
                            ? t('menteeDetails.cashflowTooltipBalance')
                            : name === 'income'
                            ? t('menteeDetails.cashflowTooltipIncome')
                            : t('menteeDetails.cashflowTooltipExpense');
                        return [formatCurrency(value, t), labelKey];
                      }}
                      labelFormatter={(value: number) =>
                        new Date(value).toLocaleDateString(locale, {
                          day: '2-digit',
                          month: 'short'
                        })
                      }
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderRadius: '0.75rem',
                        border: '1px solid #1f2937',
                        color: '#f9fafb'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Gráfico de Distribuição por Categoria */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                Despesas por Categoria
              </h2>
              {transactions && transactions.length > 0 ? (
                <ExpensesByCategoryChart transactions={transactions} t={t} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma transação para exibir
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Contas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Contas ({accounts?.length || 0})
            </h2>
            {accounts && accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account: BankAccount) => (
                  <div
                    key={account.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border border-gray-200 dark:border-gray-600"
                    style={{ borderLeftColor: account.color }}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {account.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {t('menteeDetails.accountTypeLabel', {
                        type: t(
                          `menteeDetails.accountTypes.${account.type}`,
                          account.type
                        )
                      })}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.currentBalance, t)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma conta cadastrada
              </p>
            )}
          </div>

          {/* Últimas Transações */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Últimas Transações
            </h2>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <CategoryIcon
                        type={transaction.type === 'INCOME' ? 'income' : 'expense'}
                        category={transaction.category}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {transaction.category?.name || 'Sem categoria'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.value, t)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma transação encontrada
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

