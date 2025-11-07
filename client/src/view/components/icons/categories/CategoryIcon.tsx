import { Category } from '../../../../shared/entities/category';
import { iconsMap } from './iconsMap';

interface CategoryIconProps {
  type: 'income' | 'expense';

  category?: Category;
}

export function CategoryIcon({ type, category }: CategoryIconProps) {
  const Icon =
    iconsMap[type][
      category?.icon as keyof (
        | typeof iconsMap.expense
        | typeof iconsMap.income
      )
    ] ?? iconsMap[type].default;

  return <Icon />;
}
