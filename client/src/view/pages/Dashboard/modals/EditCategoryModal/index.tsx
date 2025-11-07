import { Controller } from 'react-hook-form';
import { Input } from '../../../../components/Input';
import { Modal } from '../../../../components/Modal';
import { Select } from '../../../../components/Select';
import { useEditCategoryModalController } from './useEditCategoryModalController';
import { Button } from '../../../../components/Button';
import { Category } from '../../../../../shared/entities/category';
import { IconPicker } from '../../../../components/IconPicker';

interface EditCategoryModalProps {
  isModalOpen: boolean;

  onClose(): void;

  category: Category | null;
}

export function EditCategoryModal({
  isModalOpen,
  onClose,
  category
}: EditCategoryModalProps) {
  const { control, handleSubmit, errors, register, isLoading, t, selectedType } =
    useEditCategoryModalController(category, onClose);

  return (
    <Modal
      title={t('categories.editCategoryTitle')}
      open={isModalOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="mt-10 flex flex-col gap-4">
          <Input
            type="text"
            placeholder={t('placeholders.categoryName')}
            {...register('name')}
            error={errors.name?.message}
          />
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder={t('placeholders.type')}
                error={errors.type?.message}
                onChange={onChange}
                value={value}
                options={[
                  {
                    value: 'INCOME',
                    label: 'Receita'
                  },
                  {
                    value: 'EXPENSE',
                    label: 'Despesa'
                  }
                ]}
              />
            )}
          />
          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <IconPicker
                type={selectedType || category?.type || 'EXPENSE'}
                selectedIcon={value}
                onSelectIcon={onChange}
                error={errors.icon?.message}
              />
            )}
          />
        </div>
        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          {t('save')}
        </Button>
      </form>
    </Modal>
  );
}
