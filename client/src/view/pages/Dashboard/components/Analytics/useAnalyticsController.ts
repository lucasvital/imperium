import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../../../../shared/services/usersService';
import { useAuth } from '../../../../../shared/hooks/useAuth';

export function useAnalyticsController() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ['mentorados-analytics', month, year],
    queryFn: () => usersService.getMentoradosAnalytics({ month, year }),
    enabled: isAdmin,
  });

  return {
    analytics: data ?? [],
    isLoading,
  };
}

