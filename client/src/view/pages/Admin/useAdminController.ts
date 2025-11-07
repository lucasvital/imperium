import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../../shared/services/usersService';
import { useAuth } from '../../../shared/hooks/useAuth';
import toast from 'react-hot-toast';

export function useAdminController() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<'READ_ONLY' | 'FULL_ACCESS'>('READ_ONLY');

  const isAdmin = user?.role === 'ADMIN';

  const { data: mentorados = [], isLoading: isLoadingMentorados } = useQuery({
    queryKey: ['mentorados'],
    queryFn: () => usersService.getMentorados(),
    enabled: isAdmin,
  });

  const { data: availableUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['available-users'],
    queryFn: () => usersService.getAvailableUsers(),
    enabled: isAdmin,
  });

  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const { data: analytics = [] } = useQuery({
    queryKey: ['mentorados-analytics', month, year],
    queryFn: () => usersService.getMentoradosAnalytics({ month, year }),
    enabled: isAdmin && mentorados.length > 0,
  });

  const { mutateAsync: assignMentor, isPending: isAssigning } = useMutation({
    mutationFn: usersService.assignMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorados'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
      queryClient.invalidateQueries({ queryKey: ['mentorados-analytics'] });
      setSelectedUserId(null);
      toast.success('Mentorado adicionado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao adicionar mentorado');
    },
  });

  const { mutateAsync: removeMentor } = useMutation({
    mutationFn: usersService.removeMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorados'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
      queryClient.invalidateQueries({ queryKey: ['mentorados-analytics'] });
      toast.success('Mentorado removido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover mentorado');
    },
  });

  const handleAssign = async () => {
    if (!selectedUserId) return;
    await assignMentor({
      mentoradoId: selectedUserId,
      permission: selectedPermission
    });
    setSelectedUserId(null);
    setSelectedPermission('READ_ONLY');
  };

  const handleRemove = async (mentoradoId: string) => {
    if (confirm('Tem certeza que deseja remover este mentorado?')) {
      await removeMentor(mentoradoId);
    }
  };

  return {
    mentorados,
    availableUsers,
    isLoading: isLoadingMentorados || isLoadingUsers,
    isAssigning,
    selectedUserId,
    setSelectedUserId,
    selectedPermission,
    setSelectedPermission,
    handleAssign,
    handleRemove,
    analytics
  };
}


