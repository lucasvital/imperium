import { useBudgetsController } from './useBudgetsController';
import { BudgetCard } from './BudgetCard';
import { Spinner } from '../../../../components/Spinner';
import { useTranslation } from 'react-i18next';
import { BudgetCardSkeleton } from './BudgetCardSkeleton';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { Button } from '../../../../components/Button';

export function Budgets() {
  const { budgets, isLoading } = useBudgetsController();
  const { t } = useTranslation();
  const { openNewBudgetModal } = useDashboard();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-8 flex flex-col gap-4 md:gap-8 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-[-1px] text-gray-900 dark:text-white">
          {t('budgets.myBudgets')}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <BudgetCardSkeleton key={i} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-64 h-64 mb-6 flex items-center justify-center">
            <svg
              className="w-full h-full text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 200 200"
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M100 50 L150 100 L100 150 L50 100 Z"
                strokeDasharray="5,5"
              />
              <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M85 85 L115 115 M115 85 L85 115"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-4 text-lg">
            {t('budgets.noBudgets')}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-center mb-6 text-sm">
            {t('budgets.noBudgetsDescription')}
          </p>
          <Button onClick={openNewBudgetModal}>
            {t('budgets.createFirstBudget')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      )}
    </div>
  );
}


