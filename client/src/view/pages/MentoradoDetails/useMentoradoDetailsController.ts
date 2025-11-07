import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../../shared/services/usersService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useTransactions } from '../../../shared/hooks/useTransactions';
import { useBankAccounts } from '../../../shared/hooks/useBankAccounts';
import { useState } from 'react';

export function useMentoradoDetailsController(mentoradoId: string) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const currentDate = new Date();
  const [filters, setFilters] = useState({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear()
  });

  // Buscar mentorados para encontrar o mentorado específico
  const { data: mentorados = [] } = useQuery({
    queryKey: ['mentorados'],
    queryFn: () => usersService.getMentorados(),
    enabled: isAdmin,
  });

  const mentorado = mentorados.find(m => m.id === mentoradoId);

  // Buscar analytics do mentorado
  const { data: analyticsData = [] } = useQuery({
    queryKey: ['mentorados-analytics', filters.month, filters.year],
    queryFn: () => usersService.getMentoradosAnalytics({ 
      month: filters.month, 
      year: filters.year 
    }),
    enabled: isAdmin && !!mentoradoId,
  });

  const analytics = analyticsData.find(a => a.userId === mentoradoId);

  // Buscar transações do mentorado
  const { transactions = [], isLoading: isLoadingTransactions } = useTransactions({
    ...filters,
    targetUserId: mentoradoId
  });

  // Buscar contas do mentorado
  const { accounts = [] } = useBankAccounts(mentoradoId);

  return {
    mentorado,
    analytics,
    transactions,
    accounts,
    isLoading: (!mentorado && isAdmin) || isLoadingTransactions,
    filters,
    setFilters
  };
}

