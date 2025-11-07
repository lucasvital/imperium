import { iconsMap } from './icons/categories/iconsMap';

interface IconPickerProps {
  type: 'INCOME' | 'EXPENSE';
  selectedIcon?: string;
  onSelectIcon: (icon: string) => void;
  error?: string;
}

export function IconPicker({
  type,
  selectedIcon,
  onSelectIcon,
  error
}: IconPickerProps) {
  const iconType = type.toLowerCase() as 'income' | 'expense';
  const availableIcons = iconsMap[iconType];

  const iconKeys = Object.keys(availableIcons) as Array<
    keyof typeof availableIcons
  >;

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        Selecione um ícone
      </label>
      <div className="grid grid-cols-4 gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
        {iconKeys.map((iconKey) => {
          const Icon = availableIcons[iconKey];
          const isSelected = selectedIcon === iconKey;

          return (
            <button
              key={iconKey}
              type="button"
              onClick={() => onSelectIcon(iconKey)}
              className={`
                flex items-center justify-center p-2 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="scale-75">
                <Icon />
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

