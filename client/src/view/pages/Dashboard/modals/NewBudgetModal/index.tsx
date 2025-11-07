import { Controller } from 'react-hook-form';
import { InputCurrency } from '../../../../components/InputCurrency';
import { Modal } from '../../../../components/Modal';
import { Select } from '../../../../components/Select';
import { useNewBudgetModalController } from './useNewBudgetModalController';
import { Button } from '../../../../components/Button';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../../../shared/hooks/useLanguage';

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function NewBudgetModal() {
  const {
    control,
    handleSubmit,
    errors,
    register,
    isLoading,
    isNewBudgetModalOpen,
    closeNewBudgetModal,
    t,
    allCategories,
    currentMonth,
    currentYear,
  } = useNewBudgetModalController();

  const { currentLanguage } = useLanguage();
  const MONTHS = currentLanguage === 'pt' ? MONTHS_PT : MONTHS_EN;

  const expenseCategories = allCategories.filter((cat) => cat.type === 'EXPENSE');
  const incomeCategories = allCategories.filter((cat) => cat.type === 'INCOME');

  const categoryOptions = [
    { value: 'none', label: t('budgets.generalBudget') },
    ...(expenseCategories.length > 0 ? [
      { value: 'expense-group', label: '━━━ Despesas ━━━', disabled: true },
      ...expenseCategories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    ] : []),
    ...(incomeCategories.length > 0 ? [
      { value: 'income-group', label: '━━━ Receitas ━━━', disabled: true },
      ...incomeCategories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    ] : []),
  ];

  const monthOptions = MONTHS.map((month, index) => ({
    value: index.toString(),
    label: month,
  }));

  const currentYearValue = currentYear;
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYearValue - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <Modal
      title={t('budgets.newBudgetTitle')}
      open={isNewBudgetModalOpen}
      onClose={closeNewBudgetModal}
    >
      <form onSubmit={handleSubmit}>
        <div className="mt-10 flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              {t('placeholders.month')}
            </label>
            <Controller
              control={control}
              name="month"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder={t('placeholders.month')}
                  error={errors.month?.message}
                  onChange={(val) => onChange(parseInt(val || '0'))}
                  value={value.toString()}
                  options={monthOptions}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              {t('placeholders.year')}
            </label>
            <Controller
              control={control}
              name="year"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder={t('placeholders.year')}
                  error={errors.year?.message}
                  onChange={(val) => onChange(parseInt(val || currentYear.toString()))}
                  value={value.toString()}
                  options={yearOptions}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              {t('placeholders.selectCategory')}
            </label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder={t('placeholders.selectCategory')}
                  error={errors.categoryId?.message}
                  onChange={(val) => {
                    // Ignorar cliques nos separadores
                    if (val === 'expense-group' || val === 'income-group') {
                      return;
                    }
                    onChange(val === 'none' ? '' : val);
                  }}
                  value={value || 'none'}
                  options={categoryOptions}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              {t('placeholders.budgetLimit')}
            </label>
            <Controller
              control={control}
              name="limit"
              render={({ field: { onChange, value } }) => (
                <InputCurrency
                  value={value}
                  onChange={onChange}
                  error={errors.limit?.message}
                />
              )}
            />
          </div>
        </div>
        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          {t('budgets.createBudget')}
        </Button>
      </form>
    </Modal>
  );
}

