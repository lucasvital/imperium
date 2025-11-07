import { createContext, useCallback, useState } from 'react';
import { BankAccount } from '../../../../shared/entities/bankAccount';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useLanguage } from '../../../../shared/hooks/useLanguage';

interface DashboardContextProps {
  areValuesVisible: boolean;

  isNewAccountModalOpen: boolean;

  isNewTransactionModalOpen: boolean;

  isEditAccountModalOpen: boolean;

  isNewCategoryModalOpen: boolean;

  isNewBudgetModalOpen: boolean;

  isNewRecurringTransactionModalOpen: boolean;

  accountBeingEdited: BankAccount | null;

  newTransactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER' | null;

  selectedMentoradoId: string | null;

  t: TFunction<'translation', undefined>;

  currentLanguage: string;

  toggleValueVisibility(): void;

  openNewAccountModal(): void;

  closeNewAccountModal(): void;

  openNewTransactionModal(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): void;

  closeNewTransactionModal(): void;

  openEditAccountModal(bankAccount: BankAccount): void;

  closeEditAccountModal(): void;

  openNewCategoryModal(): void;

  closeNewCategoryModal(): void;

  openNewBudgetModal(): void;

  closeNewBudgetModal(): void;

  openNewRecurringTransactionModal(): void;

  closeNewRecurringTransactionModal(): void;

  setSelectedMentoradoId(mentoradoId: string | null): void;
}

interface DashboardProviderProps {
  children: React.ReactNode;
}

export const DashboardContext = createContext({} as DashboardContextProps);

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [areValuesVisible, setAreValuesVisible] = useState(true);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [isNewRecurringTransactionModalOpen, setIsNewRecurringTransactionModalOpen] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
  const [accountBeingEdited, setAccountBeingEdited] =
    useState<BankAccount | null>(null);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] =
    useState(false);
  const [newTransactionType, setNewTransactionType] = useState<
    'INCOME' | 'EXPENSE' | 'TRANSFER' | null
  >(null);
  const [selectedMentoradoId, setSelectedMentoradoId] = useState<string | null>(null);

  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const toggleValueVisibility = useCallback(() => {
    setAreValuesVisible((prevState) => !prevState);
  }, []);

  const openNewAccountModal = useCallback(() => {
    setIsNewAccountModalOpen(true);
  }, []);

  const closeNewAccountModal = useCallback(() => {
    setIsNewAccountModalOpen(false);
  }, []);

  const openEditAccountModal = useCallback((bankAccount: BankAccount) => {
    setAccountBeingEdited(bankAccount);
    setIsEditAccountModalOpen(true);
  }, []);

  const closeEditAccountModal = useCallback(() => {
    setAccountBeingEdited(null);
    setIsEditAccountModalOpen(false);
  }, []);

  const openNewTransactionModal = useCallback((type: 'INCOME' | 'EXPENSE' | 'TRANSFER') => {
    setNewTransactionType(type);
    setIsNewTransactionModalOpen(true);
  }, []);

  const closeNewTransactionModal = useCallback(() => {
    setNewTransactionType(null);
    setIsNewTransactionModalOpen(false);
  }, []);

  const openNewCategoryModal = useCallback(() => {
    setIsNewCategoryModalOpen(true);
  }, []);

  const closeNewCategoryModal = useCallback(() => {
    setIsNewCategoryModalOpen(false);
  }, []);

  const openNewBudgetModal = useCallback(() => {
    setIsNewBudgetModalOpen(true);
  }, []);

  const closeNewBudgetModal = useCallback(() => {
    setIsNewBudgetModalOpen(false);
  }, []);

  const openNewRecurringTransactionModal = useCallback(() => {
    setIsNewRecurringTransactionModalOpen(true);
  }, []);

  const closeNewRecurringTransactionModal = useCallback(() => {
    setIsNewRecurringTransactionModalOpen(false);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        areValuesVisible,
        toggleValueVisibility,
        isNewAccountModalOpen,
        isNewTransactionModalOpen,
        isNewCategoryModalOpen,
        isNewBudgetModalOpen,
        isNewRecurringTransactionModalOpen,
        openNewAccountModal,
        closeNewAccountModal,
        openNewTransactionModal,
        closeNewTransactionModal,
        openEditAccountModal,
        closeEditAccountModal,
        openNewCategoryModal,
        closeNewCategoryModal,
        openNewBudgetModal,
        closeNewBudgetModal,
        openNewRecurringTransactionModal,
        closeNewRecurringTransactionModal,
        newTransactionType,
        isEditAccountModalOpen,
        accountBeingEdited,
        selectedMentoradoId,
        setSelectedMentoradoId,
        t,
        currentLanguage
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
