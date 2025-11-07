import { z } from 'zod';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBankAccounts } from '../../../../../shared/hooks/useBankAccounts';
import { useCategories } from '../../../../../shared/hooks/useCategories';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../../../../../shared/services/transactionsService';
import toast from 'react-hot-toast';
import { currencyStringToNumber } from '../../../../../shared/utils/currencyStringToNumber';
import { Category } from '../../../../../shared/entities/category';
import { categoriesService } from '../../../../../shared/services/categoriesService';

const createSchema = (isTransfer: boolean) =>
  z
    .object({
      value: z.string().nonempty('Valor é obrigatório'),
      categoryId: isTransfer
        ? z.string().optional()
        : z.string().nonempty('Categoria é obrigatória'),
      bankAccountId: z.string().nonempty('Conta é obrigatória'),
      toBankAccountId: isTransfer
        ? z.string().nonempty('Conta de destino é obrigatória')
        : z.string().optional(),
      name: z.string().nonempty('Nome é obrigatório'),
      date: z.date(),
      installments: isTransfer
        ? z.string().optional()
        : z
            .string()
            .nonempty('Quantidade de parcelas é obrigatória')
            .refine((value) => {
              const parsed = Number(value);
              return Number.isInteger(parsed) && parsed >= 1 && parsed <= 120;
            }, 'Quantidade de parcelas deve ser um número entre 1 e 120'),
      firstInstallmentDate: z.date().optional(),
    })
    .refine(
      (data) => {
        if (isTransfer && data.bankAccountId && data.toBankAccountId) {
          return data.bankAccountId !== data.toBankAccountId;
        }
        return true;
      },
      {
        message: 'As contas de origem e destino devem ser diferentes',
        path: ['toBankAccountId'],
      },
    );

export function useNewTransactionModalController() {
  const {
    isNewTransactionModalOpen,
    closeNewTransactionModal,
    newTransactionType,
    t,
    selectedMentoradoId
  } = useDashboard();

  const isTransfer = newTransactionType === 'TRANSFER';
  const schema = createSchema(isTransfer);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    reset,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      value: '0',
      date: new Date(),
      installments: '1',
      firstInstallmentDate: new Date()
    }
  });

  const queryClient = useQueryClient();
  const { accounts } = useBankAccounts();
  const { categories: categoriesList } = useCategories();
  const { isLoading, mutateAsync } = useMutation(transactionsService.create);
  const { isLoading: isLoadingCategoryRemove, mutateAsync: removeCategory } =
    useMutation(categoriesService.remove);

  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);

  const [isEditCategoriesModalOpen, setIsEditCategoriesModalOpen] =
    useState(false);

  const [categoryBeingDeleted, setCategoryBeingDeleted] = useState<
    null | string
  >(null);

  const [categoryBeingEdited, setCategoryBeingEdited] =
    useState<null | Category>(null);

  const installmentsValue = watch('installments');
  const installmentsCount = Number(installmentsValue || '1');
  const isInstallmentPurchase =
    Number.isFinite(installmentsCount) && installmentsCount > 1;

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const normalizedInstallments = isTransfer
        ? 1
        : Math.min(
            120,
            Math.max(1, Number.parseInt(data.installments || '1', 10) || 1),
          );

      const totalValue = currencyStringToNumber(data.value);

      const payload: any = {
        ...data,
        value: totalValue,
        type: newTransactionType!,
        date: data.date.toISOString(),
        targetUserId: selectedMentoradoId || undefined,
      };

      delete payload.installments;
      delete payload.firstInstallmentDate;

      // Se for transferência, adicionar toBankAccountId e remover categoryId
      if (newTransactionType === 'TRANSFER') {
        payload.toBankAccountId = data.toBankAccountId;
        payload.categoryId = undefined;
      } else if (normalizedInstallments > 1) {
        payload.installments = normalizedInstallments;
        payload.totalValue = totalValue;
        payload.value = Number(
          (totalValue / normalizedInstallments).toFixed(2),
        );
        payload.firstInstallmentDate = (
          data.firstInstallmentDate ?? data.date
        ).toISOString();
      }

      await mutateAsync(payload);

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(
        newTransactionType === 'EXPENSE'
          ? t('toastMessages.transactions.createExpenseSuccess')
          : newTransactionType === 'INCOME'
          ? t('toastMessages.transactions.createIncomeSuccess')
          : t('toastMessages.transactions.createTransferSuccess')
      );
      closeNewTransactionModal();
      reset();
    } catch {
      toast.error(
        newTransactionType === 'EXPENSE'
          ? t('toastMessages.transactions.createExpenseError')
          : newTransactionType === 'INCOME'
          ? t('toastMessages.transactions.createIncomeError')
          : t('toastMessages.transactions.createTransferError')
      );
    }
  });

  async function handleDeleteCategory() {
    try {
      await removeCategory(categoryBeingDeleted!);

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });

      toast.success(t('toastMessages.categories.deleteCategorySuccess'));
      closeNewTransactionModal();
    } catch {
      toast.error(t('toastMessages.categories.deleteCategoryError'));
    }
  }

  function handleOpenDeleteCategoryModal(categoryId: string) {
    setIsDeleteCategoryModalOpen(true);
    setCategoryBeingDeleted(categoryId);
  }

  function handleCloseDeleteCategoryModal() {
    setIsDeleteCategoryModalOpen(false);
  }

  function handleOpenEditCategoriesModal(category: Category) {
    setIsEditCategoriesModalOpen(true);
    setCategoryBeingEdited(category);
  }

  function handleCloseEditCategoriesModal() {
    setIsEditCategoriesModalOpen(false);
    setCategoryBeingEdited(null);
  }

  const categories = useMemo(() => {
    return categoriesList.filter(
      (category) => category.type === newTransactionType
    );
  }, [categoriesList, newTransactionType]);

  return {
    isNewTransactionModalOpen,
    closeNewTransactionModal,
    newTransactionType,
    register,
    errors,
    control,
    handleSubmit,
    accounts,
    categories,
    isLoading,
    reset,
    t,
    isInstallmentPurchase,
    handleOpenDeleteCategoryModal,
    handleCloseEditCategoriesModal,
    handleOpenEditCategoriesModal,
    isLoadingCategoryRemove,
    handleDeleteCategory,
    categoryBeingEdited,
    isDeleteCategoryModalOpen,
    isEditCategoriesModalOpen,
    handleCloseDeleteCategoryModal
  };
}
