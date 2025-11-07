import { useAdminController } from './useAdminController';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { TrashIcon, PersonIcon } from '@radix-ui/react-icons';
import { Select } from '../../components/Select';
import { Logo } from '../../components/Logo';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export function Admin() {
  const {
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
    analytics
  } = useAdminController();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const availableOptions = availableUsers
    .filter((user) => !user.mentorId)
    .map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`
    }));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <header className="flex-shrink-0 h-12 flex items-center justify-between p-4 md:px-8 md:pt-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-teal-900 dark:text-white hover:opacity-80"
          >
            <Logo className="h-8" />
          </button>
          <h1 className="text-xl font-bold text-teal-900 dark:text-white">
            Área Administrativa
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:px-8 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-6 pb-4">
          {/* Seção de Adicionar Mentorado */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Adicionar Mentorado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Select
                  placeholder="Selecione um usuário do sistema"
                  options={availableOptions}
                  value={selectedUserId}
                  onChange={(value) => setSelectedUserId(value || null)}
                />
              </div>
              <div>
                <Select
                  placeholder="Permissão"
                  options={[
                    { value: 'READ_ONLY', label: 'Somente Leitura' },
                    { value: 'FULL_ACCESS', label: 'Acesso Total' }
                  ]}
                  value={selectedPermission || 'READ_ONLY'}
                  onChange={(value) => setSelectedPermission(value as 'READ_ONLY' | 'FULL_ACCESS' || 'READ_ONLY')}
                />
              </div>
              <div className="md:col-span-3">
                <Button
                  onClick={handleAssign}
                  isLoading={isAssigning}
                  disabled={!selectedUserId || isAssigning}
                  className="w-full md:w-auto"
                >
                  <PersonIcon className="w-4 h-4 mr-2" />
                  Adicionar Mentorado
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Mentorados */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Meus Mentorados ({mentorados.length})
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="w-8 h-8" />
              </div>
            ) : mentorados.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhum mentorado cadastrado. Adicione usuários para começar a gerenciá-los.
              </p>
            ) : (
              <div className="space-y-3">
                {mentorados.map((mentorado) => {
                  const mentoradoAnalytics = analytics.find(a => a.userId === mentorado.id);
                  
                  return (
                    <div
                      key={mentorado.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-teal-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {mentorado.name}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              mentorado.mentorPermission === 'READ_ONLY'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {mentorado.mentorPermission === 'READ_ONLY' ? 'Somente Leitura' : 'Acesso Total'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {mentorado.email}
                          </p>
                          
                          {mentoradoAnalytics && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receitas</p>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  {formatCurrency(mentoradoAnalytics.totalIncome, t)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Despesas</p>
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                  {formatCurrency(mentoradoAnalytics.totalExpense, t)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
                                <p className={`text-sm font-semibold ${
                                  mentoradoAnalytics.balance >= 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {formatCurrency(mentoradoAnalytics.balance, t)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Transações</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {mentoradoAnalytics.transactionsCount}
                                </p>
                              </div>
                            </div>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

