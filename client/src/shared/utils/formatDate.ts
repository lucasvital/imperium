import { TFunction } from 'i18next';

export function formatDate(date: Date | string, t: TFunction<'translation', undefined>) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return Intl.DateTimeFormat(t('formatCurrency.country'), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}
