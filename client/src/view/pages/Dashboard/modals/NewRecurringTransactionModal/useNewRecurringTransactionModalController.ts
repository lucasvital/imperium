import { z } from 'zod';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRecurringTransactions } from '../../../../../shared/hooks/useRecurringTransactions';
import { useBankAccounts } from '../../../../../shared/hooks/useBankAccounts';
import { useCategories } from '../../../../../shared/hooks/useCategories';
import { currencyStringToNumber } from '../../../../../shared/utils/currencyStringToNumber';
import { useMemo } from 'react';

const schema = z.object({
  name: z.string().nonempty('Nome é obrigatório'),
  value: z.string().nonempty('Valor é obrigatório'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().optional(),
  bankAccountId: z.string().nonempty('Conta é obrigatória'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  nextDueDate: z.date(),
});

type FormData = z.infer<typeof schema>;

export function useNewRecurringTransactionModalController() {
  const {
    isNewRecurringTransactionModalOpen,
    closeNewRecurringTransactionModal,
    t,
  } = useDashboard();

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      value: '0',
      type: 'EXPENSE',
      categoryId: '',
      bankAccountId: '',
      frequency: 'MONTHLY',
      startDate: new Date(),
      endDate: null,
      nextDueDate: new Date(),
    },
  });

  const { accounts } = useBankAccounts();
  const { categories: allCategories } = useCategories();
  const { createRecurringTransaction, isCreating } =
    useRecurringTransactions();

  const selectedType = watch('type');

  const categories = useMemo(() => {
    return allCategories.filter((category) => category.type === selectedType);
  }, [allCategories, selectedType]);

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const valueNumber = currencyStringToNumber(data.value);
      if (valueNumber <= 0) {
        return;
      }

      await createRecurringTransaction({
        name: data.name,
        value: valueNumber,
        type: data.type,
        categoryId: data.categoryId || undefined,
        bankAccountId: data.bankAccountId,
        frequency: data.frequency,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate?.toISOString(),
        nextDueDate: data.nextDueDate.toISOString(),
        isActive: true,
      });

      closeNewRecurringTransactionModal();
      reset();
    } catch (error) {
      // Error já é tratado no hook
    }
  });

  return {
    isNewRecurringTransactionModalOpen,
    closeNewRecurringTransactionModal,
    register,
    errors,
    control,
    handleSubmit,
    isLoading: isCreating,
    reset,
    t,
    accounts,
    categories,
    selectedType,
  };
}

