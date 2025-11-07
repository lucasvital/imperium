import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Modal } from '../../../../../components/Modal';
import { Button } from '../../../../../components/Button';
import { useFiltersModalController } from './useFiltersModalController';
import { cn } from '../../../../../../shared/utils/cn';
import { Input } from '../../../../../components/Input';
import { InputCurrency } from '../../../../../components/InputCurrency';
import { DatePickerInput } from '../../../../../components/DatePickerInput';
import { TransactionsFilters } from '../../../../../../shared/services/transactionsService/getAll';
import { currencyStringToNumber } from '../../../../../../shared/utils/currencyStringToNumber';

interface FiltersModalProps {
  open: boolean;

  onClose(): void;

  currentFilters: TransactionsFilters;

  onApplyFilters(filters: {
    bankAccountId: string | undefined;
    year: number;
    name?: string;
    minValue?: number;
    maxValue?: number;
    categoryIds?: string[];
    startDate?: string;
    endDate?: string;
  }): void;
}

export function FiltersModal({
  open,
  onClose,
  currentFilters,
  onApplyFilters
}: FiltersModalProps) {
  const {
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
  } = useFiltersModalController({ currentFilters });

  function handleApply() {
    onApplyFilters({
      bankAccountId: selectedBankAccountId,
      year: selectedYear,
      name: name || undefined,
      minValue: minValue ? currencyStringToNumber(minValue) : undefined,
      maxValue: maxValue ? currencyStringToNumber(maxValue) : undefined,
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    });
  }

  return (
    <Modal
      open={open}
      title={t('transactions.filtersModal.title')}
      onClose={onClose}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Busca por Nome */}
        <div>
          <label className="text-lg tracking-[-1px] font-bold text-gray-800 dark:text-gray-200 mb-2 block">
            {t('transactions.filtersModal.name')}
          </label>
          <Input
            type="text"
            placeholder={t('transactions.filtersModal.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Valor Mínimo/Máximo */}
        <div>
          <label className="text-lg tracking-[-1px] font-bold text-gray-800 dark:text-gray-200 mb-2 block">
            {t('transactions.filtersModal.valueRange')}
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                {t('transactions.filtersModal.minValue')}
              </span>
              <InputCurrency
                value={minValue}
                onChange={setMinValue}
              />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                {t('transactions.filtersModal.maxValue')}
              </span>
              <InputCurrency
                value={maxValue}
                onChange={setMaxValue}
              />
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div>
          <label className="text-lg tracking-[-1px] font-bold text-gray-800 dark:text-gray-200 mb-2 block">
            {t('transactions.filtersModal.categories')}
          </label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => handleToggleCategory(category.id)}
                  className={cn(
                    'p-2 rounded-2xl w-full text-left text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2',
                    isSelected && '!bg-teal-100 dark:!bg-teal-900/30'
                  )}
                >
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    isSelected ? 'bg-teal-900 dark:bg-teal-400' : 'bg-gray-300 dark:bg-gray-500'
                  )} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Período Customizado */}
        <div>
          <label className="text-lg tracking-[-1px] font-bold text-gray-800 dark:text-gray-200 mb-2 block">
            {t('transactions.filtersModal.customPeriod')}
          </label>
          <div className="space-y-2">
            <DatePickerInput
              t={t}
              label={t('transactions.filtersModal.startDate')}
              value={startDate ?? null}
              onChange={(date) => setStartDate(date ?? null)}
              nullable
            />
            <DatePickerInput
              t={t}
              label={t('transactions.filtersModal.endDate')}
              value={endDate ?? null}
              onChange={(date) => setEndDate(date ?? null)}
              nullable
            />
          </div>
        </div>

        {/* Conta */}
        <div>
          <span className="text-lg tracking-[-1px] font-bold text-gray-800 dark:text-gray-200 block mb-2">
            {t('transactions.filtersModal.account')}
          </span>
          <div className="space-y-2 mt-2">
            {accounts.map((account) => {
              return (
                <button
                  key={account.id}
                  onClick={() => handleSelectBankAccount(account.id)}
                  className={cn(
                    'p-2 rounded-2xl w-full text-left text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors',
                    account.id === selectedBankAccountId && '!bg-teal-100 dark:!bg-teal-900/30'
                  )}
                >
                  {account.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ano */}
        <div>
          <span className="text-lg tracking-[-1px] font-bold text-gray-800 dark:text-gray-200 block mb-2">
            {t('transactions.filtersModal.year')}
          </span>
          <div className="mt-2 w-52 flex items-center justify-between">
            <button
              className="h-12 w-12 flex justify-center items-center text-gray-800 dark:text-gray-200"
              onClick={() => handleChangeYear(-1)}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm font-medium tracking-[-0.5px] text-black dark:text-white">
                {selectedYear}
              </span>
            </div>
            <button
              onClick={() => handleChangeYear(1)}
              className="h-12 w-12 flex justify-center items-center text-gray-800 dark:text-gray-200"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={handleClearFilters}
        >
          {t('transactions.filtersModal.clear')}
        </Button>
        <Button
          className="flex-1"
          onClick={handleApply}
        >
          {t('transactions.filtersModal.submit')}
        </Button>
      </div>
    </Modal>
  );
}
