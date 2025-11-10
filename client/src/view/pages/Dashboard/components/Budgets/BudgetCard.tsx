import { Budget } from '../../../../../shared/entities/budget';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import { CategoryIcon } from '../../../../components/icons/categories/CategoryIcon';
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { Button } from '../../../../components/Button';
import { useBudgets } from '../../../../../shared/hooks/useBudgets';
import { useState } from 'react';
import { DeleteModal } from '../../../../components/DeleteModal';
import { InputCurrency } from '../../../../components/InputCurrency';
import { Modal } from '../../../../components/Modal';
import { currencyStringToNumber } from '../../../../../shared/utils/currencyStringToNumber';
import { useDashboard } from '../../DashboardContext/useDashboard';

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const { t } = useTranslation();
  const { selectedMentoradoId } = useDashboard();
  const isMentorView = Boolean(selectedMentoradoId);
  const { updateBudget, removeBudget, isUpdating, isRemoving } = useBudgets(
    budget.month,
    budget.year,
    selectedMentoradoId || undefined,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLimit, setEditLimit] = useState(
    budget.limit.toString().replace('.', ','),
  );

  const isIncome = budget.isIncome || budget.category?.type === 'INCOME';
  const percentage = budget.percentage || 0;
  const spent = budget.spent || 0;
  const remaining = budget.remaining ?? (isIncome ? -budget.limit : budget.limit);
  
  // Para receitas: meta atingida quando percentage >= 100
  // Para despesas: limite ultrapassado quando percentage > 100
  const isOverBudget = isIncome ? false : percentage > 100;
  const isNearLimit = isIncome ? false : percentage >= 80 && percentage <= 100;
  const goalReached = isIncome && percentage >= 100;
  const goalNear = isIncome && percentage >= 80 && percentage < 100;

  const handleUpdate = async () => {
    const numValue = currencyStringToNumber(editLimit);
    if (!isNaN(numValue) && numValue > 0) {
      await updateBudget({ id: budget.id, limit: numValue });
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = async () => {
    await removeBudget(budget.id);
    setIsDeleteModalOpen(false);
  };

  // Cores diferentes para receitas e despesas
  const progressColor = isIncome
    ? goalReached
      ? 'bg-green-500'
      : goalNear
      ? 'bg-yellow-500'
      : 'bg-blue-500'
    : isOverBudget
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-yellow-500'
    : 'bg-green-500';

  return (
    <>
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {budget.category ? (
              <>
                <CategoryIcon
                  type={budget.category.type.toLowerCase() as 'income' | 'expense'}
                  category={budget.category}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {budget.category.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('budgets.categoryBudget')}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('budgets.generalBudget')}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(budget.year, budget.month).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
          {!isMentorView && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-900 dark:hover:text-white transition-colors"
              >
                <Pencil1Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('budgets.limit')}:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(budget.limit, t)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {isIncome ? t('budgets.received') : t('budgets.spent')}:
            </span>
            <span
              className={`font-semibold ${
                isIncome
                  ? goalReached
                    ? 'text-green-600 dark:text-green-400'
                    : goalNear
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                  : isOverBudget
                  ? 'text-red-600 dark:text-red-400'
                  : isNearLimit
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {formatCurrency(spent, t)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {isIncome ? t('budgets.aboveGoal') : t('budgets.remaining')}:
            </span>
            <span
              className={`font-semibold ${
                isIncome
                  ? remaining >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                  : remaining < 0
                  ? 'text-red-600 dark:text-red-400'
                  : remaining < budget.limit * 0.2
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {isIncome && remaining < 0 ? '-' : ''}
              {formatCurrency(Math.abs(remaining), t)}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">
                {percentage.toFixed(1)}%
              </span>
              {isIncome ? (
                goalReached ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {t('budgets.goalReached')}
                  </span>
                ) : goalNear ? (
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    {t('budgets.nearGoal')}
                  </span>
                ) : null
              ) : (
                <>
                  {isOverBudget && (
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      {t('budgets.overBudget')}
                    </span>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                      {t('budgets.nearLimit')}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ease-out ${progressColor}`}
                style={{
                  width: `${Math.min(100, Math.max(0, percentage))}%`,
                  transition: 'width 0.5s ease-out, background-color 0.3s ease-out',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {!isMentorView && (
        <>
          <DeleteModal
            t={t}
            title={t('budgets.deleteBudgetTitle')}
            isLoading={isRemoving}
            onConfirm={handleDelete}
            onClose={() => setIsDeleteModalOpen(false)}
            open={isDeleteModalOpen}
          />

          <Modal
            title={t('budgets.editBudgetTitle')}
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          >
            <div className="mt-10">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                {t('placeholders.budgetLimit')}
              </label>
              <InputCurrency
                value={editLimit}
                onChange={(val) => setEditLimit(val || '0')}
              />
            </div>
            <Button
              className="w-full mt-6"
              onClick={handleUpdate}
              isLoading={isUpdating}
            >
              {t('save')}
            </Button>
          </Modal>
        </>
      )}
    </>
  );
}

