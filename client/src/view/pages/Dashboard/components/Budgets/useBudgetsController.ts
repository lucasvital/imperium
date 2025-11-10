import { useState } from 'react';
import { useBudgets } from '../../../../../shared/hooks/useBudgets';
import { useDashboard } from '../../DashboardContext/useDashboard';

export function useBudgetsController() {
  const currentDate = new Date();
  const [filters] = useState({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
  });

  const { selectedMentoradoId } = useDashboard();

  const { budgets, isLoading } = useBudgets(
    filters.month,
    filters.year,
    selectedMentoradoId || undefined,
  );

  return {
    budgets,
    isLoading,
  };
}


