import { Cross2Icon, CrossCircledIcon } from '@radix-ui/react-icons';
import { cn } from '../../shared/utils/cn';
import { useState, useEffect } from 'react';
import { formatDate } from '../../shared/utils/formatDate';
import { Popover } from './Popover';
import { DatePicker } from './DatePicker';
import { TFunction } from 'i18next';

interface DatePickerInputProps {
  t: TFunction<'translation', undefined>;

  error?: string;

  className?: string;

  value?: Date | null;

  onChange?(date: Date | null): void;

  label?: string;

  nullable?: boolean;
}

export function DatePickerInput({
  error,
  className,
  value,
  onChange,
  t,
  label,
  nullable = false,
}: DatePickerInputProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ?? null);

  useEffect(() => {
    setSelectedDate(value ?? null);
  }, [value]);

  function handleChangeDate(date: Date | null) {
    setSelectedDate(date);
    onChange?.(date ?? null);
  }

  const displayValue = selectedDate ? formatDate(selectedDate, t) : '--/--/----';

  return (
    <div>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              'relative bg-white dark:bg-gray-700 w-full pt-4 text-left rounded-lg border border-gray-500 dark:border-gray-600 px-3 h-[52px] text-gray-700 dark:text-gray-300 focus:border-gray-800 dark:focus:border-gray-400 transition-all outline-none',
              error && '!border-red-900 dark:!border-red-600',
              className
            )}
          >
            <span className="text-gray-700 dark:text-gray-400 text-xs left-[13px] top-2 pointer-events-none absolute">
              {label || t('placeholders.date')}
            </span>
            <span>{displayValue}</span>
            {nullable && selectedDate && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                onClick={(event) => {
                  event.stopPropagation();
                  handleChangeDate(null);
                }}
                aria-label="Limpar data"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Content>
          <DatePicker value={selectedDate} onChange={handleChangeDate} />
        </Popover.Content>
      </Popover.Root>
      {error && (
        <div className="flex gap-2 items-center mt-2 text-red-900 dark:text-red-400">
          <CrossCircledIcon />
          <span className="text-xs">{error}</span>{' '}
        </div>
      )}
    </div>
  );
}

