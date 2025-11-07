import { useQuery } from '@tanstack/react-query';
import { bankAccountsService } from '../services/bankAccountsService';

export function useBankAccounts(targetUserId?: string) {
  const { data, isFetched, isLoading } = useQuery({
    queryKey: ['bankAccounts', targetUserId],
    queryFn: () => bankAccountsService.getAll(targetUserId),
    staleTime: Infinity
  });

  return { accounts: data ?? [], isFetched, isLoading };
}
