import { Modal } from '../../../../components/Modal';
import { useManageMentoradosController } from './useManageMentoradosController';
import { Button } from '../../../../components/Button';
import { Spinner } from '../../../../components/Spinner';
import { TrashIcon } from '@radix-ui/react-icons';
import { Select } from '../../../../components/Select';

export function ManageMentoradosModal() {
  const {
    isOpen,
    onClose,
    mentorados,
    availableUsers,
    isLoading,
    isAssigning,
    selectedUserId,
    setSelectedUserId,
    selectedPermission,
    setSelectedPermission,
    handleAssign,
    handleRemove,
    t
  } = useManageMentoradosController();

  if (!isOpen) return null;

  const availableOptions = availableUsers
    .filter((user) => !user.mentorId)
    .map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`
    }));

  return (
    <Modal title="Gerenciar Mentorados" open={isOpen} onClose={onClose}>
      <div className="mt-6 space-y-6">
        {/* Adicionar Mentorado */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Adicionar Mentorado
          </label>
          <div className="space-y-3">
            <Select
              placeholder="Selecione um usuário"
              options={availableOptions}
              value={selectedUserId || ''}
              onChange={(value) => setSelectedUserId(value || null)}
            />
            <Select
              placeholder="Selecione a permissão"
              options={[
                { value: 'READ_ONLY', label: 'Somente Leitura' },
                { value: 'FULL_ACCESS', label: 'Acesso Total' }
              ]}
              value={selectedPermission || 'READ_ONLY'}
              onChange={(value) => setSelectedPermission(value as 'READ_ONLY' | 'FULL_ACCESS' || 'READ_ONLY')}
            />
            <Button
              onClick={handleAssign}
              isLoading={isAssigning}
              disabled={!selectedUserId || isAssigning}
              className="w-full"
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Lista de Mentorados */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Meus Mentorados ({mentorados.length})
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="w-8 h-8" />
            </div>
          ) : mentorados.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Nenhum mentorado cadastrado
            </p>
          ) : (
            <div className="space-y-2">
              {mentorados.map((mentorado) => (
                <div
                  key={mentorado.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {mentorado.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mentorado.email}
                    </p>
                    {mentorado.mentorPermission && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Permissão: {mentorado.mentorPermission === 'READ_ONLY' ? 'Somente Leitura' : 'Acesso Total'}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleRemove(mentorado.id)}
                    className="ml-4"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

