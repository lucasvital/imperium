import { useRecurringTransactions } from '../../../../../shared/hooks/useRecurringTransactions';
import { Spinner } from '../../../../components/Spinner';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { formatDate } from '../../../../../shared/utils/formatDate';
import { useTranslation } from 'react-i18next';
import { RecurringTransactionCard } from './RecurringTransactionCard';
import { useDashboard } from '../../DashboardContext/useDashboard';

export function RecurringTransactions() {
  const { recurringTransactions, isLoading } = useRecurringTransactions();
  const { t } = useDashboard();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl h-full w-full p-6 flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        {t('recurringTransactions.myRecurringTransactions')}
      </h2>

      {recurringTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-48 h-48 mb-6 flex items-center justify-center">
            <svg
              className="w-full h-full text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="50" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="50" cy="100" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="150" cy="100" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="100" cy="150" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5,5"
                d="M100 50 L50 100 M50 100 L100 150 M100 150 L150 100 M150 100 L100 50"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-2 text-lg font-medium">
            {t('recurringTransactions.noRecurringTransactions')}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-center text-sm">
            {t('recurringTransactions.noRecurringTransactionsDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringTransactions.map((recurring) => (
            <RecurringTransactionCard
              key={recurring.id}
              recurringTransaction={recurring}
            />
          ))}
        </div>
      )}
    </div>
  );
}

