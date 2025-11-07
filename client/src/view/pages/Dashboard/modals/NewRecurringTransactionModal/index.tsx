import { Controller } from 'react-hook-form';
import { Input } from '../../../../components/Input';
import { InputCurrency } from '../../../../components/InputCurrency';
import { Modal } from '../../../../components/Modal';
import { Select } from '../../../../components/Select';
import { useNewRecurringTransactionModalController } from './useNewRecurringTransactionModalController';
import { Button } from '../../../../components/Button';
import { DatePickerInput } from '../../../../components/DatePickerInput';

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Diária' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
];

export function NewRecurringTransactionModal() {
  const {
    closeNewRecurringTransactionModal,
    isNewRecurringTransactionModalOpen,
    control,
    handleSubmit,
    errors,
    register,
    accounts,
    categories,
    isLoading,
    t,
    selectedType,
  } = useNewRecurringTransactionModalController();

  const isExpense = selectedType === 'EXPENSE';

  return (
    <Modal
      title={t('recurringTransactions.newRecurringTransaction')}
      open={isNewRecurringTransactionModalOpen}
      onClose={closeNewRecurringTransactionModal}
      contentClassName="max-w-[720px]"
    >
      <form onSubmit={handleSubmit}>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            type="text"
            placeholder={
              isExpense
                ? t('placeholders.expenseName')
                : t('placeholders.incomeName')
            }
            {...register('name')}
            error={errors.name?.message}
            className="md:col-span-2"
          />

          <div className="md:col-span-2">
            <span className="text-gray-600 text-sm tracking-[-0.5px] dark:text-white">
              {isExpense
                ? t('placeholders.expenseValue')
                : t('placeholders.incomeValue')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-lg tracking-[-0.5px] dark:text-white">
                {t('currency')}{' '}
              </span>
              <Controller
                control={control}
                name="value"
                defaultValue="0"
                render={({ field: { onChange, value } }) => (
                  <InputCurrency
                    error={errors.value?.message}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </div>
          </div>

          <Controller
            control={control}
            name="type"
            defaultValue="EXPENSE"
            render={({ field: { onChange, value } }) => (
              <Select
                onChange={onChange}
                value={value}
                error={errors.type?.message}
                placeholder={t('placeholders.type')}
                options={[
                  { value: 'EXPENSE', label: t('transactions.dropdown.expenses') },
                  { value: 'INCOME', label: t('transactions.dropdown.incomes') },
                ]}
              />
            )}
          />

          <Controller
            control={control}
            name="categoryId"
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <Select
                onChange={onChange}
                placeholder={t('placeholders.category')}
                value={value}
                error={errors.categoryId?.message}
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
              />
            )}
          />

          <Controller
            control={control}
            name="bankAccountId"
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <Select
                onChange={onChange}
                value={value}
                error={errors.bankAccountId?.message}
                placeholder={
                  isExpense
                    ? t('placeholders.payWith')
                    : t('placeholders.receiveWith')
                }
                options={accounts.map((account) => ({
                  value: account.id,
                  label: account.name,
                }))}
              />
            )}
          />

          <Controller
            control={control}
            name="frequency"
            defaultValue="MONTHLY"
            render={({ field: { onChange, value } }) => (
              <Select
                onChange={onChange}
                value={value}
                error={errors.frequency?.message}
                placeholder={t('recurringTransactions.frequency')}
                options={FREQUENCY_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: t(`recurringTransactions.frequencies.${opt.value}`),
                }))}
              />
            )}
          />

          <Controller
            control={control}
            name="startDate"
            defaultValue={new Date()}
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                t={t}
                value={value}
                onChange={(date) => onChange(date ?? value ?? new Date())}
                error={errors.startDate?.message}
                label={t('recurringTransactions.startDate')}
              />
            )}
          />

          <Controller
            control={control}
            name="nextDueDate"
            defaultValue={new Date()}
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                t={t}
                value={value}
                onChange={(date) => onChange(date ?? value ?? new Date())}
                error={errors.nextDueDate?.message}
                label={t('recurringTransactions.nextDueDate')}
              />
            )}
          />

          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                t={t}
                value={value ?? null}
                onChange={(date) => onChange(date ?? null)}
                error={errors.endDate?.message}
                label={`${t('recurringTransactions.endDate')} (${t('placeholders.optional') || 'opcional'})`}
                nullable
              />
            )}
          />
        </div>
        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          {t('recurringTransactions.create')}
        </Button>
      </form>
    </Modal>
  );
}

