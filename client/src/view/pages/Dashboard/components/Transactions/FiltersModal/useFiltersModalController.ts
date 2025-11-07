import { useState } from 'react';
import { useBankAccounts } from '../../../../../../shared/hooks/useBankAccounts';
import { useCategories } from '../../../../../../shared/hooks/useCategories';
import { useDashboard } from '../../../DashboardContext/useDashboard';
import { TransactionsFilters } from '../../../../../../shared/services/transactionsService/getAll';

interface UseFiltersModalControllerProps {
  currentFilters: TransactionsFilters;
}

export function useFiltersModalController({
  currentFilters,
}: UseFiltersModalControllerProps) {
  const { accounts } = useBankAccounts();
  const { categories } = useCategories();
  const { t } = useDashboard();

  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    string | undefined
  >(currentFilters.bankAccountId);

  const [selectedYear, setSelectedYear] = useState<number>(
    currentFilters.year || new Date().getFullYear()
  );

  const [name, setName] = useState<string>(currentFilters.name || '');

  const [minValue, setMinValue] = useState<string>(
    currentFilters.minValue?.toString() || ''
  );

  const [maxValue, setMaxValue] = useState<string>(
    currentFilters.maxValue?.toString() || ''
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    currentFilters.categoryIds || []
  );

  const [startDate, setStartDate] = useState<Date | null>(
    currentFilters.startDate ? new Date(currentFilters.startDate) : null
  );

  const [endDate, setEndDate] = useState<Date | null>(
    currentFilters.endDate ? new Date(currentFilters.endDate) : null
  );

  function handleSelectBankAccount(accountId: string) {
    setSelectedBankAccountId(
      selectedBankAccountId === accountId ? undefined : accountId
    );
  }

  function handleChangeYear(delta: number) {
    setSelectedYear((prev) => prev + delta);
  }

  function handleToggleCategory(categoryId: string) {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  }

  function handleClearFilters() {
    setSelectedBankAccountId(undefined);
    setSelectedYear(new Date().getFullYear());
    setName('');
    setMinValue('');
    setMaxValue('');
    setSelectedCategoryIds([]);
    setStartDate(null);
    setEndDate(null);
  }

  return {
    handleSelectBankAccount,
    selectedBankAccountId,
    selectedYear,
    handleChangeYear,
    accounts,
    categories,
    name,
    setName,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    selectedCategoryIds,
    handleToggleCategory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleClearFilters,
    t,
  };
}
