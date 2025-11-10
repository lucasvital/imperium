import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useIncomeByCategory } from '../../../../../shared/hooks/useAnalytics';
import { Spinner } from '../../../../components/Spinner';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useTheme } from '../../../../../shared/hooks/useTheme';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
  '#8DD1E1',
  '#D084D0',
];

export function IncomeByCategoryChart() {
  const { t, selectedMentoradoId } = useDashboard();
  const { theme } = useTheme();
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const isDark = theme === 'dark';

  const { data = [], isLoading } = useIncomeByCategory({
    month,
    year,
    targetUserId: selectedMentoradoId || undefined,
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('reports.incomeByCategory')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {t('reports.noData')}
        </p>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: item.total,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {t('reports.incomeByCategory')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: { name: string; percent: number }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

