import { z } from 'zod';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '../../../../../shared/entities/category';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../../../../../shared/services/categoriesService';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().nonempty('Nome é obrigatório'),
  icon: z.string().nonempty('Ícone é obrigatório'),
  type: z.enum(['INCOME', 'EXPENSE'])
});

type FormData = z.infer<typeof schema>;

export function useEditCategoryModalController(
  category: Category | null,
  onClose: () => void
) {
  const { t } = useDashboard();

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
      name: category?.name || '',
      icon: category?.icon || 'default',
      type: category?.type || 'EXPENSE'
    }
  });

  const queryClient = useQueryClient();
  const { isLoading, mutateAsync: updateCategory } = useMutation(
    categoriesService.update
  );

  const selectedType = watch('type');

  const handleSubmit = hookFormSubmit(async (data) => {
    if (!category?.id) return;

    try {
      await updateCategory({
        id: category.id,
        name: data.name,
        icon: data.icon,
        type: data.type
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(t('toastMessages.categories.editCategorySuccess'));
      onClose();
      reset();
    } catch {
      toast.error(t('toastMessages.categories.editCategoryError'));
    }
  });

  return {
    register,
    errors,
    control,
    handleSubmit,
    isLoading,
    reset,
    t,
    selectedType
  };
}
