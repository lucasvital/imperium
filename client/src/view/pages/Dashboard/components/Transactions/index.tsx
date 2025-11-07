/* eslint-disable prettier/prettier */
import { FilterIcon } from '../../../../components/icons/FilterIcon';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  BR_MONTHS,
  EN_MONTHS
} from '../../../../../shared/config/constants/months';
import { SliderOption } from './SliderOption';
import { SliderNavigation } from './SliderNavigation';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { CategoryIcon } from '../../../../components/icons/categories/CategoryIcon';
import { cn } from '../../../../../shared/utils/cn';
import { useTransactionsController } from './useTransactionsController';
import { Spinner } from '../../../../components/Spinner';
import emptyState from '../../../../../assets/empty.svg';
import { TransactionTypeDropdown } from './TransactionTypeDropdown';
import { FiltersModal } from './FiltersModal';
import { formatDate } from '../../../../../shared/utils/formatDate';
import { EditTransactionModal } from '../../modals/EditTransactionModal';
import { useTheme } from '../../../../../shared/hooks/useTheme';
import { useMentorados } from '../../../../../shared/hooks/useMentorados';
import { TransactionItemSkeleton } from './TransactionItemSkeleton';

export function Transactions() {
  const {
    areValuesVisible,
    isLoading,
    isInitialLoading,
    transactions,
    isFiltersModalOpen,
    handleCloseFiltersModal,
    handleOpenFiltersModal,
    handleChangeFilters,
    filters,
    handleApplyFilters,
    handleCloseEditTransactionsModal,
    handleOpenEditTransactionsModal,
    isEditTransactionsModalOpen,
    transactionBeingEdited,
    t,
    currentLanguage,
    selectedMentoradoId
  } = useTransactionsController();

  const { theme } = useTheme();
  const { mentorados } = useMentorados();
  
  const selectedMentorado = mentorados.find(m => m.id === selectedMentoradoId);
  const isReadOnly = selectedMentorado?.mentorPermission === 'READ_ONLY';

  const hasTransactions = transactions.length > 0;

  return (
    <div className="bg-gray-100 rounded-2xl h-full w-full p-10 flex flex-col dark:bg-gray-700">
      {isInitialLoading && (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner className="w-10 h-10" />
        </div>
      )}
      {!isInitialLoading && (
        <>
          <header>
            <FiltersModal
              open={isFiltersModalOpen}
              onClose={handleCloseFiltersModal}
              onApplyFilters={handleApplyFilters}
              currentFilters={filters}
            />

            <div className="flex items-center justify-between">
              <TransactionTypeDropdown
                t={t}
                onSelect={(type) => {
                  // Converter 'TRANSFER' para undefined no filtro se necessário, ou manter como está
                  handleChangeFilters('type')(type === 'TRANSFER' ? 'TRANSFER' : type);
                }}
                selectedType={filters.type as 'INCOME' | 'EXPENSE' | 'TRANSFER' | undefined}
                theme={theme}
              />

              <button onClick={handleOpenFiltersModal}>
                <FilterIcon
                  selectedTheme={theme === 'dark' ? 'dark' : 'light'}
                />
              </button>
            </div>

            <div className="mt-6 relative">
              <Swiper
                slidesPerView={3}
                centeredSlides
                initialSlide={filters.month}
                onSlideChange={(swiper) => {
                  handleChangeFilters('month')(swiper.realIndex);
                }}
              >
                <SliderNavigation />
                {currentLanguage === 'pt'
                  ? BR_MONTHS.map((month, index) => (
                      <SwiperSlide key={month}>
                        {({ isActive }) => (
                          <SliderOption
                            isActive={isActive}
                            month={month}
                            index={index}
                          />
                        )}
                      </SwiperSlide>
                    ))
                  : EN_MONTHS.map((month, index) => (
                      <SwiperSlide key={month}>
                        {({ isActive }) => (
                          <SliderOption
                            isActive={isActive}
                            month={month}
                            index={index}
                          />
                        )}
                      </SwiperSlide>
                    ))}
              </Swiper>
            </div>
          </header>

          <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <TransactionItemSkeleton key={i} />
                ))}
              </div>
            )}
            {!hasTransactions && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <img src={emptyState} alt="Empty transactions" className="w-48 h-48 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                  {t('transactions.empty')}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-md">
                  {t('transactions.emptyDescription')}
                </p>
              </div>
            )}

            {hasTransactions && !isLoading && (
              <>
                {transactionBeingEdited && (
                  <EditTransactionModal
                    isModalOpen={isEditTransactionsModalOpen}
                    onClose={handleCloseEditTransactionsModal}
                    transaction={transactionBeingEdited}
                  />
                )}

                {transactions.map((transaction, index) => {
                  const isInstallment = Boolean(transaction.installmentGroupId);
                  const canEdit = !isReadOnly;

                  return (
                    <div
                      key={transaction.id}
                      role={canEdit ? "button" : undefined}
                      onClick={canEdit
                        ? () => handleOpenEditTransactionsModal(transaction)
                        : undefined}
                      className={cn(
                        "bg-white dark:bg-gray-500 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200",
                        canEdit && "hover:scale-[1.01] hover:shadow-md cursor-pointer"
                      )}
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <CategoryIcon
                          type={
                            transaction.type === 'EXPENSE' || (transaction.type === 'TRANSFER' && transaction.relatedTransactionId)
                              ? 'expense'
                              : transaction.type === 'TRANSFER'
                              ? 'expense'
                              : 'income'
                          }
                          category={transaction.category}
                        />

                        <div className="">
                          <strong className="tracking-[-0.5px] font-bold block dark:text-gray-800">
                            {transaction.relatedTransactionId && transaction.relatedTransaction?.bankAccount
                              ? `${transaction.name.replace('Transferência: ', '')} → ${transaction.relatedTransaction.bankAccount.name}`
                              : transaction.name}
                          </strong>
                          <span className="text-sm text-gray-600 dark:text-gray-800">
                            {formatDate(new Date(transaction.date), t)}
                          </span>
                          {isInstallment &&
                            transaction.installmentNumber &&
                            transaction.totalInstallments && (
                              <span className="text-xs text-gray-500 dark:text-gray-700 block">
                                {t('transactions.installments.badge', {
                                  current: transaction.installmentNumber,
                                  total: transaction.totalInstallments,
                                })}
                              </span>
                            )}
                        </div>
                      </div>

                      <span
                        className={cn(
                          'font-medium tracking-[-0.5px]',
                          transaction.relatedTransactionId
                            ? 'text-blue-800 dark:text-blue-900'
                            : transaction.type === 'EXPENSE'
                            ? 'text-red-800 dark:text-red-900'
                            : 'text-green-800 dark:text-green-900',
                          !areValuesVisible && 'blur-sm'
                        )}
                      >
                        {transaction.relatedTransactionId 
                          ? '↔ ' 
                          : transaction.type === 'EXPENSE' 
                          ? '- ' 
                          : '+ '}
                        {formatCurrency(transaction.value, t)}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
