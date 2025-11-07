import { z } from 'zod';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../../../../../shared/services/categoriesService';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().nonempty('Nome é obrigatório'),
  icon: z.string().nonempty('Ícone é obrigatório'),
  type: z.enum(['INCOME', 'EXPENSE'])
});

type FormData = z.infer<typeof schema>;

export function useNewCategoryModalController() {
  const { isNewCategoryModalOpen, closeNewCategoryModal, t } = useDashboard();

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
      icon: 'default',
      type: 'EXPENSE'
    }
  });

  const queryClient = useQueryClient();
  const { isLoading, mutateAsync } = useMutation(categoriesService.create);

  const selectedType = watch('type');

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync({
        name: data.name,
        icon: data.icon,
        type: data.type
      });

      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('toastMessages.categories.createCategorySuccess'));
      closeNewCategoryModal();
      reset();
    } catch {
      toast.error(t('toastMessages.categories.createCategoryError'));
    }
  });

  return {
    isNewCategoryModalOpen,
    closeNewCategoryModal,
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
