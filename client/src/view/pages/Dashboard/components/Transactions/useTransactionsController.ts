import { useState } from 'react';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useTransactions } from '../../../../../shared/hooks/useTransactions';
import { TransactionsFilters } from '../../../../../shared/services/transactionsService/getAll';
import { Transaction } from '../../../../../shared/entities/transaction';
import { useCategories } from '../../../../../shared/hooks/useCategories';

export function useTransactionsController() {
  const { areValuesVisible, toggleValueVisibility, t, currentLanguage, selectedMentoradoId } =
    useDashboard();

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const [isEditTransactionsModalOpen, setIsEditTransactionsModalOpen] =
    useState(false);

  const [transactionBeingEdited, setTransactionBeingEdited] =
    useState<null | Transaction>(null);

  const [filters, setFilters] = useState<TransactionsFilters>({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  const { transactions, isLoading, isInitialLoading, refetchTransactions } =
    useTransactions({
      ...filters,
      targetUserId: selectedMentoradoId || undefined
    });

  const { categories } = useCategories();

  // Using currying just to practice
  function handleChangeFilters<TFilter extends keyof TransactionsFilters>(
    filter: TFilter
  ) {
    return (value: TransactionsFilters[TFilter]) => {
      if (value == filters[filter]) return;
      setFilters((prevState) => ({
        ...prevState,
        [filter]: value
      }));
    };
  }

  function handleApplyFilters({
    bankAccountId,
    year,
    name,
    minValue,
    maxValue,
    categoryIds,
    startDate,
    endDate,
  }: {
    bankAccountId: string | undefined;
    year: number;
    name?: string;
    minValue?: number;
    maxValue?: number;
    categoryIds?: string[];
    startDate?: string;
    endDate?: string;
  }) {
    handleChangeFilters('bankAccountId')(bankAccountId);
    handleChangeFilters('year')(year);
    if (name !== undefined) handleChangeFilters('name')(name);
    if (minValue !== undefined) handleChangeFilters('minValue')(minValue);
    if (maxValue !== undefined) handleChangeFilters('maxValue')(maxValue);
    if (categoryIds !== undefined) handleChangeFilters('categoryIds')(categoryIds);
    if (startDate !== undefined) handleChangeFilters('startDate')(startDate);
    if (endDate !== undefined) handleChangeFilters('endDate')(endDate);
    setIsFiltersModalOpen(false);
  }

  function handleOpenFiltersModal() {
    setIsFiltersModalOpen(true);
  }

  function handleCloseFiltersModal() {
    setIsFiltersModalOpen(false);
  }

  function handleOpenEditTransactionsModal(transaction: Transaction) {
    setIsEditTransactionsModalOpen(true);
    setTransactionBeingEdited(transaction);
  }

  function handleCloseEditTransactionsModal() {
    setIsEditTransactionsModalOpen(false);
    setTransactionBeingEdited(null);
  }

  return {
    areValuesVisible,
    toggleValueVisibility,
    isLoading,
    isInitialLoading,
    transactions: transactions,
    handleOpenFiltersModal,
    handleCloseFiltersModal,
    isFiltersModalOpen,
    filters,
    setFilters,
    handleChangeFilters,
    handleApplyFilters,
    isEditTransactionsModalOpen,
    transactionBeingEdited,
    handleOpenEditTransactionsModal,
    handleCloseEditTransactionsModal,
    categories,
    t,
    currentLanguage,
    selectedMentoradoId
  };
}
