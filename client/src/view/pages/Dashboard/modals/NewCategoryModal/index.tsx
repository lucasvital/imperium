import { Controller } from 'react-hook-form';
import { Input } from '../../../../components/Input';
import { Modal } from '../../../../components/Modal';
import { Select } from '../../../../components/Select';
import { useNewCategoryModalController } from './useNewCategoryModalController';
import { Button } from '../../../../components/Button';
import { IconPicker } from '../../../../components/IconPicker';

export function NewCategoryModal() {
  const {
    control,
    handleSubmit,
    errors,
    register,
    isLoading,
    isNewCategoryModalOpen,
    closeNewCategoryModal,
    t,
    selectedType
  } = useNewCategoryModalController();

  return (
    <Modal
      title={t('categories.newCategoryTitle')}
      open={isNewCategoryModalOpen}
      onClose={closeNewCategoryModal}
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
            defaultValue="EXPENSE"
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
                type={selectedType || 'EXPENSE'}
                selectedIcon={value}
                onSelectIcon={onChange}
                error={errors.icon?.message}
              />
            )}
          />
        </div>
        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          {t('categories.createCategory')}
        </Button>
      </form>
    </Modal>
  );
}
