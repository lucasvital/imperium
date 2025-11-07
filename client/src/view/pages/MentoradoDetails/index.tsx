import { useParams, useNavigate } from 'react-router-dom';
import { useMentoradoDetailsController } from './useMentoradoDetailsController';
import { Logo } from '../../components/Logo';
import { Spinner } from '../../components/Spinner';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button } from '../../components/Button';
import { Transaction } from '../../../shared/entities/transaction';
import { BankAccount } from '../../../shared/entities/bankAccount';
import { TFunction } from 'i18next';
import { CategoryIcon } from '../../components/icons/categories/CategoryIcon';

function ExpensesByCategoryChart({ transactions, t }: { transactions: Transaction[]; t: TFunction }) {
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  
  const categoryTotals = expenses.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || 'Sem categoria';
    acc[categoryName] = (acc[categoryName] || 0) + transaction.value;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  const categories = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value, percentage: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma despesa para exibir
        </p>
      </div>
    );
  }

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="space-y-3">
      {categories.map((category, index) => (
        <div key={category.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {category.name}
            </span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {formatCurrency(category.value, t)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all shadow-sm"
              style={{
                width: `${category.percentage}%`,
                backgroundColor: colors[index % colors.length],
                opacity: 0.9
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MentoradoDetails() {
  const { mentoradoId } = useParams<{ mentoradoId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    mentorado,
    analytics,
    transactions,
    accounts,
    isLoading
  } = useMentoradoDetailsController(mentoradoId!);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  if (!mentorado) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Mentorado não encontrado
        </p>
        <Button onClick={() => navigate('/')}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between p-4 md:px-8 md:py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="text-teal-900 dark:text-white hover:opacity-80"
          >
            <Logo className="h-14" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-teal-900 dark:text-white">
              {mentorado.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mentorado.email}
            </p>
          </div>
        </div>
        {mentorado.mentorPermission && (
          <span className={`px-4 py-2 text-xs rounded-full font-medium ${
            mentorado.mentorPermission === 'READ_ONLY'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {mentorado.mentorPermission === 'READ_ONLY' ? 'Somente Leitura' : 'Acesso Total'}
          </span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:px-8 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Receitas Totais
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(analytics?.totalIncome || 0, t)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Despesas Totais
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(analytics?.totalExpense || 0, t)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Saldo
              </p>
              <p className={`text-2xl font-bold ${
                (analytics?.balance || 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(analytics?.balance || 0, t)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Transações
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.transactionsCount || 0}
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Receitas vs Despesas */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                Receitas vs Despesas
              </h2>
              <div className="h-64 flex flex-col justify-end items-center gap-8">
                <div className="flex items-end justify-center gap-8 flex-1 w-full">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-20 bg-green-500 dark:bg-green-600 rounded-t transition-all hover:bg-green-600 dark:hover:bg-green-500 cursor-pointer shadow-lg"
                      style={{ 
                        height: `${Math.max(20, Math.min(200, ((analytics?.totalIncome || 0) / Math.max(analytics?.totalIncome || 1, analytics?.totalExpense || 1, 1)) * 200))}px` 
                      }}
                      title={`Receitas: ${formatCurrency(analytics?.totalIncome || 0, t)}`}
                    />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-200">Receitas</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(analytics?.totalIncome || 0, t)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-20 bg-red-500 dark:bg-red-600 rounded-t transition-all hover:bg-red-600 dark:hover:bg-red-500 cursor-pointer shadow-lg"
                      style={{ 
                        height: `${Math.max(20, Math.min(200, ((analytics?.totalExpense || 0) / Math.max(analytics?.totalIncome || 1, analytics?.totalExpense || 1, 1)) * 200))}px` 
                      }}
                      title={`Despesas: ${formatCurrency(analytics?.totalExpense || 0, t)}`}
                    />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-200">Despesas</p>
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(analytics?.totalExpense || 0, t)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Distribuição por Categoria */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                Despesas por Categoria
              </h2>
              {transactions && transactions.length > 0 ? (
                <ExpensesByCategoryChart transactions={transactions} t={t} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma transação para exibir
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Contas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Contas ({accounts?.length || 0})
            </h2>
            {accounts && accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account: BankAccount) => (
                  <div
                    key={account.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border border-gray-200 dark:border-gray-600"
                    style={{ borderLeftColor: account.color }}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {account.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Tipo: {account.type}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.currentBalance, t)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma conta cadastrada
              </p>
            )}
          </div>

          {/* Últimas Transações */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Últimas Transações
            </h2>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <CategoryIcon
                        type={transaction.type === 'INCOME' ? 'income' : 'expense'}
                        category={transaction.category}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {transaction.category?.name || 'Sem categoria'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.value, t)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma transação encontrada
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

