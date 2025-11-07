import { useState } from 'react';
import { useBudgets } from '../../../../../shared/hooks/useBudgets';

export function useBudgetsController() {
  const currentDate = new Date();
  const [filters] = useState({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
  });

  const { budgets, isLoading } = useBudgets(filters.month, filters.year);

  return {
    budgets,
    isLoading,
  };
}


