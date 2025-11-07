import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsService } from '../services/budgetsService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useBudgets(month: number, year: number) {
  const { t } = useTranslation();

  const { data = [], isLoading } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetsService.getAll({ month, year }),
  });

  const queryClient = useQueryClient();

  const { mutateAsync: createBudget, isPending: isCreating } = useMutation({
    mutationFn: budgetsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('toastMessages.budgets.createBudgetSuccess'));
    },
    onError: () => {
      toast.error(t('toastMessages.budgets.createBudgetError'));
    },
  });

  const { mutateAsync: updateBudget, isPending: isUpdating } = useMutation({
    mutationFn: budgetsService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('toastMessages.budgets.updateBudgetSuccess'));
    },
    onError: () => {
      toast.error(t('toastMessages.budgets.updateBudgetError'));
    },
  });

  const { mutateAsync: removeBudget, isPending: isRemoving } = useMutation({
    mutationFn: budgetsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('toastMessages.budgets.removeBudgetSuccess'));
    },
    onError: () => {
      toast.error(t('toastMessages.budgets.removeBudgetError'));
    },
  });

  return {
    budgets: data,
    isLoading,
    createBudget,
    updateBudget,
    removeBudget,
    isCreating,
    isUpdating,
    isRemoving,
  };
}


