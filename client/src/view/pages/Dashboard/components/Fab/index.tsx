import { PlusIcon } from '@radix-ui/react-icons';
import { DropdownMenu } from '../../../../components/DropdownMenu';
import { CategoryIcon } from '../../../../components/icons/categories/CategoryIcon';
import { BankAccountIcon } from '../../../../components/icons/BankAccountIcon';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { NewCategoryIcon } from '../../../../components/icons/NewCategoryIcon';
import { useMentorados } from '../../../../../shared/hooks/useMentorados';
import { RecurringTransactionIcon } from '../../../../components/icons/RecurringTransactionIcon';

export function Fab() {
  const {
    openNewAccountModal,
    openNewTransactionModal,
    openNewCategoryModal,
    openNewBudgetModal,
    openNewRecurringTransactionModal,
    t,
    selectedMentoradoId
  } = useDashboard();

  const { mentorados } = useMentorados();
  
  const selectedMentorado = mentorados.find(m => m.id === selectedMentoradoId);
  const isReadOnly = selectedMentorado?.mentorPermission === 'READ_ONLY';

  if (isReadOnly) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button className=" text-white h-12 w-12 bg-teal-900 rounded-full flex items-center justify-center">
            <PlusIcon className="w-6 h-6" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content side="top" className="bg-white dark:bg-gray-700 ">
          <DropdownMenu.Item
            className="gap-2 dark:hover:!bg-gray-600 dark:text-white"
            onSelect={openNewCategoryModal}
          >
            <NewCategoryIcon />
            {t('fab.newCategory')}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="gap-2 dark:hover:!bg-gray-600 dark:text-white"
            onSelect={() => openNewTransactionModal('EXPENSE')}
          >
            <CategoryIcon type="expense" />
            {t('fab.newExpense')}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="gap-2 dark:hover:!bg-gray-600 dark:text-white"
            onSelect={() => openNewTransactionModal('INCOME')}
          >
            <CategoryIcon type="income" />
            {t('fab.newIncome')}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="gap-2 dark:hover:!bg-gray-600 dark:text-white"
            onSelect={() => openNewTransactionModal('TRANSFER')}
          >
            <BankAccountIcon />
            {t('fab.newTransfer')}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="gap-2 dark:hover:!bg-gray-600 dark:text-white"
            onSelect={openNewAccountModal}
          >
            <BankAccountIcon />
            {t('fab.newAccount')}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="gap-2 dark:hover:!bg-gray-600 dark:text-white"
            onSelect={openNewBudgetModal}
          >
            <NewCategoryIcon />
            {t('fab.newBudget')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="gap-2 dark:hover:!bg-gray-600 dark:text-white"
            onSelect={openNewRecurringTransactionModal}
          >
            <RecurringTransactionIcon />
            {t('fab.newRecurringTransaction')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}
