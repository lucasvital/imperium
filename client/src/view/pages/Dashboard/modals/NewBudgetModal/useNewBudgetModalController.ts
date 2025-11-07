import { z } from 'zod';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBudgets } from '../../../../../shared/hooks/useBudgets';
import { useCategories } from '../../../../../shared/hooks/useCategories';
import { currencyStringToNumber } from '../../../../../shared/utils/currencyStringToNumber';

const schema = z.object({
  limit: z.string().nonempty('Limite é obrigatório'),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  month: z.number().min(0).max(11),
  year: z.number().min(2000),
});

type FormData = z.infer<typeof schema>;

export function useNewBudgetModalController() {
  const { isNewBudgetModalOpen, closeNewBudgetModal, t } = useDashboard();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      limit: '0',
      categoryId: '',
      month: currentMonth,
      year: currentYear,
    },
  });

  const { categories } = useCategories();
  
  // Usar o hook apenas para obter a função de criação
  const { createBudget, isCreating } = useBudgets(currentMonth, currentYear);

  // Permitir tanto despesas quanto receitas
  const allCategories = categories;

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const limitValue = currencyStringToNumber(data.limit);
      if (limitValue <= 0) {
        return;
      }

      await createBudget({
        limit: limitValue,
        categoryId: data.categoryId || undefined,
        month: data.month,
        year: data.year,
      });

      closeNewBudgetModal();
      reset();
    } catch (error) {
      // Error já é tratado no hook useBudgets
    }
  });

  return {
    isNewBudgetModalOpen,
    closeNewBudgetModal,
    register,
    errors,
    control,
    handleSubmit,
    isLoading: isCreating,
    reset,
    t,
    allCategories,
    currentMonth,
    currentYear,
  };
}

