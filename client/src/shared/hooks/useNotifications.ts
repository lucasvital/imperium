import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notificationsService';

interface UseNotificationsParams {
  read?: boolean;
}

export function useNotifications(params?: UseNotificationsParams) {
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsService.getAll(params),
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: () => notificationsService.countUnread(),
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  const { mutateAsync: markAsRead, isPending: isMarkingAsRead } = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const { mutateAsync: markAllAsRead, isPending: isMarkingAllAsRead } = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const { mutateAsync: removeNotification, isPending: isRemoving } = useMutation({
    mutationFn: notificationsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: data,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isRemoving,
  };
}


