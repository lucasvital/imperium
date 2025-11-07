import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMonthlyTrend } from '../../../../../shared/hooks/useAnalytics';
import { Spinner } from '../../../../components/Spinner';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { BR_MONTHS, EN_MONTHS } from '../../../../../shared/config/constants/months';
import { useTheme } from '../../../../../shared/hooks/useTheme';

export function MonthlyTrendChart() {
  const { t, currentLanguage } = useDashboard();
  const { theme } = useTheme();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  
  const isDark = theme === 'dark';

  const { data: incomeData = [], isLoading: isLoadingIncome } = useMonthlyTrend(year, 'INCOME');
  const { data: expenseData = [], isLoading: isLoadingExpenses } = useMonthlyTrend(year, 'EXPENSE');

  const isLoading = isLoadingIncome || isLoadingExpenses;
  const MONTHS = currentLanguage === 'pt' ? BR_MONTHS : EN_MONTHS;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Combinar dados de receitas e despesas por mês
  const chartData = MONTHS.map((monthName, index) => {
    const income = incomeData.find((d) => d.month === index)?.total || 0;
    const expense = expenseData.find((d) => d.month === index)?.total || 0;
    return {
      month: monthName,
      income,
      expense,
    };
  });

  const incomeLabel = t('reports.incomeLabel');
  const expensesLabel = t('reports.expensesLabel');
  const hasData = chartData.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('reports.monthlyTrend')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {t('reports.noData')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {t('reports.monthlyTrend')} - {year}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
          <XAxis
            dataKey="month"
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
            style={{ fontSize: '12px' }}
            tickFormatter={(value: number) => {
              // Simplificar formato para o eixo Y
              if (value >= 1_000_000) {
                return `${(value / 1_000_000).toFixed(1)}M`;
              }
              if (value >= 1_000) {
                return `${(value / 1_000).toFixed(0)}K`;
              }
              return value.toString();
            }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value, t)}
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : 'white',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
            }}
            labelStyle={{ 
              color: isDark ? '#f3f4f6' : '#111827' 
            }}
          />
          <Legend 
            wrapperStyle={{ 
              color: isDark ? '#d1d5db' : '#6b7280' 
            }} 
          />
          <Line
            type="monotone"
            dataKey="income"
            name={incomeLabel}
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name={expensesLabel}
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

