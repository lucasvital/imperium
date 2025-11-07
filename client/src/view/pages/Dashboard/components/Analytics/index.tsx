import { useAnalyticsController } from './useAnalyticsController';
import { Spinner } from '../../../../components/Spinner';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import { useDashboard } from '../../DashboardContext/useDashboard';
import { useAuth } from '../../../../../shared/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Analytics() {
  const { analytics, isLoading } = useAnalyticsController();
  const { t } = useDashboard();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl h-full w-full p-6 flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl h-full w-full p-6 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum mentorado encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        Análise Comparativa dos Mentorados
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analytics.map((item) => (
          <div
            key={item.userId}
            onClick={() => navigate(`/mentorado/${item.userId}`)}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-teal-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
              {item.userName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {item.userEmail}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Receitas:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(item.totalIncome, t)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Despesas:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(item.totalExpense, t)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="font-semibold text-gray-900 dark:text-white">Saldo:</span>
                <span
                  className={`font-bold ${
                    item.balance >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatCurrency(item.balance, t)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Saldo Total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.totalBalance, t)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>{item.transactionsCount} transações</span>
                <span>{item.accountsCount} contas</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

