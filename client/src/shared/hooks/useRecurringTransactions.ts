import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringTransactionsService } from '../services/recurringTransactionsService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CreateRecurringTransactionParams } from '../services/recurringTransactionsService/create';
import { UpdateRecurringTransactionParams } from '../services/recurringTransactionsService/update';

export function useRecurringTransactions() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: () => recurringTransactionsService.getAll(),
  });

  const { mutateAsync: createRecurringTransaction, isPending: isCreating } =
    useMutation({
      mutationFn: recurringTransactionsService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['recurring-transactions'],
        });
        toast.success(t('toastMessages.recurringTransactions.createSuccess'));
      },
      onError: () => {
        toast.error(t('toastMessages.recurringTransactions.createError'));
      },
    });

  const { mutateAsync: updateRecurringTransaction, isPending: isUpdating } =
    useMutation({
      mutationFn: recurringTransactionsService.update,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['recurring-transactions'],
        });
        toast.success(t('toastMessages.recurringTransactions.updateSuccess'));
      },
      onError: () => {
        toast.error(t('toastMessages.recurringTransactions.updateError'));
      },
    });

  const { mutateAsync: removeRecurringTransaction, isPending: isRemoving } =
    useMutation({
      mutationFn: recurringTransactionsService.remove,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['recurring-transactions'],
        });
        toast.success(t('toastMessages.recurringTransactions.removeSuccess'));
      },
      onError: () => {
        toast.error(t('toastMessages.recurringTransactions.removeError'));
      },
    });

  const { mutateAsync: toggleActiveRecurringTransaction, isPending: isToggling } =
    useMutation({
      mutationFn: recurringTransactionsService.toggleActive,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['recurring-transactions'],
        });
      },
      onError: () => {
        toast.error(t('toastMessages.recurringTransactions.toggleError'));
      },
    });

  return {
    recurringTransactions: data,
    isLoading,
    createRecurringTransaction,
    updateRecurringTransaction,
    removeRecurringTransaction,
    toggleActiveRecurringTransaction,
    isCreating,
    isUpdating,
    isRemoving,
    isToggling,
  };
}

