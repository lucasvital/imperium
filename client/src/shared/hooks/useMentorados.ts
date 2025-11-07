import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/usersService';
import { useAuth } from './useAuth';

export function useMentorados() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isFetching } = useQuery({
    queryKey: ['mentorados'],
    queryFn: () => usersService.getMentorados(),
    enabled: isAdmin, // Só busca se for admin
  });

  return {
    mentorados: data ?? [],
    isLoading: isFetching,
  };
}

