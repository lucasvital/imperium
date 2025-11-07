import { RecurringTransaction } from '../../../../../shared/entities/recurringTransaction';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { formatDate } from '../../../../../shared/utils/formatDate';
import { useTranslation } from 'react-i18next';
import { CategoryIcon } from '../../../../components/icons/categories/CategoryIcon';
import { TrashIcon, Pencil1Icon, PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { Button } from '../../../../components/Button';
import { useRecurringTransactions } from '../../../../../shared/hooks/useRecurringTransactions';
import { useState } from 'react';
import { DeleteModal } from '../../../../components/DeleteModal';
import { cn } from '../../../../../shared/utils/cn';

interface RecurringTransactionCardProps {
  recurringTransaction: RecurringTransaction;
}

export function RecurringTransactionCard({
  recurringTransaction,
}: RecurringTransactionCardProps) {
  const { t } = useTranslation();
  const {
    removeRecurringTransaction,
    toggleActiveRecurringTransaction,
    isRemoving,
    isToggling,
  } = useRecurringTransactions();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    await removeRecurringTransaction(recurringTransaction.id);
    setIsDeleteModalOpen(false);
  };

  const handleToggleActive = async () => {
    await toggleActiveRecurringTransaction(recurringTransaction.id);
  };

  const isExpense = recurringTransaction.type === 'EXPENSE';
  const nextDueDate = new Date(recurringTransaction.nextDueDate);
  const isOverdue = nextDueDate < new Date() && recurringTransaction.isActive;

  const frequencyLabels: Record<string, string> = {
    DAILY: t('recurringTransactions.frequencies.DAILY'),
    WEEKLY: t('recurringTransactions.frequencies.WEEKLY'),
    MONTHLY: t('recurringTransactions.frequencies.MONTHLY'),
    YEARLY: t('recurringTransactions.frequencies.YEARLY'),
  };

  return (
    <>
      <div
        className={cn(
          'p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600',
          !recurringTransaction.isActive && 'opacity-60',
          isOverdue && 'border-red-500 dark:border-red-400'
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {recurringTransaction.category && (
              <CategoryIcon
                type={recurringTransaction.category.type.toLowerCase() as 'income' | 'expense'}
                category={recurringTransaction.category}
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {recurringTransaction.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {frequencyLabels[recurringTransaction.frequency]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-900 dark:hover:text-white transition-colors disabled:opacity-50"
              title={
                recurringTransaction.isActive
                  ? t('recurringTransactions.pause')
                  : t('recurringTransactions.resume')
              }
            >
              {recurringTransaction.isActive ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('recurringTransactions.value')}:
            </span>
            <span
              className={cn(
                'font-semibold',
                isExpense
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              )}
            >
              {isExpense ? '-' : '+'} {formatCurrency(recurringTransaction.value, t)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('recurringTransactions.account')}:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {recurringTransaction.bankAccount?.name || '-'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('recurringTransactions.nextDueDate')}:
            </span>
            <span
              className={cn(
                'font-semibold',
                isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              )}
            >
              {formatDate(nextDueDate, t)}
            </span>
          </div>
          {recurringTransaction.endDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('recurringTransactions.endDate')}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatDate(new Date(recurringTransaction.endDate), t)}
              </span>
            </div>
          )}
          {isOverdue && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
              {t('recurringTransactions.overdue')}
            </div>
          )}
          {!recurringTransaction.isActive && (
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
              {t('recurringTransactions.paused')}
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        t={t}
        title={t('recurringTransactions.deleteRecurringTransactionTitle')}
        isLoading={isRemoving}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        open={isDeleteModalOpen}
      />
    </>
  );
}

