import { useState } from 'react';
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart';
import { IncomeByCategoryChart } from './IncomeByCategoryChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { YearlySummaryCard } from './YearlySummaryCard';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { cn } from '../../../../../shared/utils/cn';

export function Reports() {
  const { t } = useDashboard();
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="w-full space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold tracking-[-1px] text-gray-900 dark:text-white mb-6">
          {t('reports.title')}
        </h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('monthly')}
            className={cn(
              'pb-2 px-4 font-medium transition-colors',
              activeTab === 'monthly'
                ? 'text-teal-900 dark:text-teal-400 border-b-2 border-teal-900 dark:border-teal-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            {t('reports.monthly')}
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={cn(
              'pb-2 px-4 font-medium transition-colors',
              activeTab === 'yearly'
                ? 'text-teal-900 dark:text-teal-400 border-b-2 border-teal-900 dark:border-teal-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            {t('reports.yearly')}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'monthly' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpensesByCategoryChart />
            <IncomeByCategoryChart />
          </div>
        )}

        {activeTab === 'yearly' && (
          <div className="space-y-6">
            <YearlySummaryCard />
            <MonthlyTrendChart />
          </div>
        )}
      </div>
    </div>
  );
}

