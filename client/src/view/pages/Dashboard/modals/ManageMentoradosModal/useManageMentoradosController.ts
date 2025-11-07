import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../../../../shared/services/usersService';
import { useAuth } from '../../../../../shared/hooks/useAuth';
import toast from 'react-hot-toast';
import { useDashboard } from '../../DashboardContext/useDashboard';

export function useManageMentoradosController() {
  const { user } = useAuth();
  const { t, isManageMentoradosModalOpen, closeManageMentoradosModal } = useDashboard();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<'READ_ONLY' | 'FULL_ACCESS'>('READ_ONLY');

  const isAdmin = user?.role === 'ADMIN';

  const { data: mentorados = [], isLoading: isLoadingMentorados } = useQuery({
    queryKey: ['mentorados'],
    queryFn: () => usersService.getMentorados(),
    enabled: isAdmin && isManageMentoradosModalOpen,
  });

  const { data: availableUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['available-users'],
    queryFn: () => usersService.getAvailableUsers(),
    enabled: isAdmin && isManageMentoradosModalOpen,
  });

  const { mutateAsync: assignMentor, isPending: isAssigning } = useMutation({
    mutationFn: usersService.assignMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorados'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
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
    isOpen: isManageMentoradosModalOpen,
    onClose: closeManageMentoradosModal,
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
    t,
  };
}

