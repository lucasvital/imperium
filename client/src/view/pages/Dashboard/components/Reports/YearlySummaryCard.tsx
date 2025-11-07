import { useYearlySummary } from '../../../../../shared/hooks/useAnalytics';
import { Spinner } from '../../../../components/Spinner';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { cn } from '../../../../../shared/utils/cn';

export function YearlySummaryCard() {
  const { t } = useDashboard();
  const currentDate = new Date();
  const year = currentDate.getFullYear();

  const { data, isLoading } = useYearlySummary(year);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-32">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {t('reports.yearlySummary')} - {year}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('reports.totalIncome')}
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.totalIncome, t)}
          </p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('reports.totalExpenses')}
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(data.totalExpenses, t)}
          </p>
        </div>
        <div
          className={cn(
            'p-4 rounded-lg',
            data.balance >= 0
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-orange-50 dark:bg-orange-900/20'
          )}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('reports.balance')}
          </p>
          <p
            className={cn(
              'text-2xl font-bold',
              data.balance >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
            )}
          >
            {formatCurrency(data.balance, t)}
          </p>
        </div>
      </div>
    </div>
  );
}

