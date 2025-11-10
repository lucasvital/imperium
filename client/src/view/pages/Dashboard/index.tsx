import { LanguageSwitcher } from '../../components/LanguageSwitcher.tsx';
import { Logo } from '../../components/Logo';
import ThemeSwitcher from '../../components/ThemeSwitcher.tsx';
import { UserMenu } from '../../components/UserMenu';
import { NotificationsBell } from '../../components/NotificationsBell';
import {
  DashboardContext,
  DashboardProvider
} from './DashboardContext/index.tsx';
import { MentoradoSelector } from '../../components/MentoradoSelector';
import { Accounts } from './components/Accounts';
import { Fab } from './components/Fab/index.tsx';
import { Transactions } from './components/Transactions/index.tsx';
import { EditAccountModal } from './modals/EditAccountModal/index.tsx';
import { NewAccountModal } from './modals/NewAccountModal/index.tsx';
import { NewCategoryModal } from './modals/NewCategoryModal/index.tsx';
import { NewTransactionModal } from './modals/NewTransactionModal/index.tsx';
import { NewBudgetModal } from './modals/NewBudgetModal/index.tsx';
import { Analytics } from './components/Analytics';
import { Budgets } from './components/Budgets';
import { RecurringTransactions } from './components/RecurringTransactions';
import { NewRecurringTransactionModal } from './modals/NewRecurringTransactionModal';
import { Reports } from './components/Reports';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { t } = useTranslation();

  return (
    <DashboardProvider>
      <DashboardContext.Consumer>
        {({
          accountBeingEdited,
          selectedMentoradoId,
          setSelectedMentoradoId
        }) => (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <header className="sticky top-0 z-50 flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-8 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <Logo className="h-14 text-teal-900 dark:text-white" />
              <div className="flex items-center gap-x-4 h-full">
                <div className="flex items-center h-full">
                  <LanguageSwitcher />
                </div>
                <div className="flex items-center h-full">
                  <ThemeSwitcher />
                </div>
                <div className="flex items-center h-full">
                  <NotificationsBell />
                </div>
                <div className="flex items-center h-full">
                  <UserMenu />
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:px-8 md:pb-8">
              <div className="flex flex-col gap-4">
                {isAdmin && (
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('menteeDetails.selectHint')}
                    </p>
                    <MentoradoSelector
                      selectedMentoradoId={selectedMentoradoId}
                      onSelectMentorado={setSelectedMentoradoId}
                    />
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <Accounts />
                  </div>
                  <div className="w-full md:w-1/2">
                    <Transactions />
                  </div>
                </div>
                <div className="w-full">
                  <Analytics />
                </div>
                <div className="w-full">
                  <Budgets />
                </div>
                <div className="w-full">
                  <RecurringTransactions />
                </div>
                <div className="w-full">
                  <Reports />
                </div>
              </div>
            </main>

            <Fab />
            <NewAccountModal />
            <NewTransactionModal />
            <NewCategoryModal />
            <NewBudgetModal />
            <NewRecurringTransactionModal />
            {accountBeingEdited && <EditAccountModal />}
          </div>
        )}
      </DashboardContext.Consumer>
    </DashboardProvider>
  );
}
