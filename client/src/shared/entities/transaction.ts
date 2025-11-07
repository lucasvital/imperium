import { Category } from './category';

export interface Transaction {
  id: string;

  categoryId?: string;

  bankAccountId: string;

  name: string;

  value: number;

  date: string;

  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';

  category?: Category;

  relatedTransactionId?: string;

  relatedTransaction?: {
    id: string;
    bankAccountId: string;
    bankAccount?: {
      id: string;
      name: string;
      type: string;
    };
  };

  installmentGroupId?: string;

  installmentNumber?: number;

  totalInstallments?: number;

  installmentTotalValue?: number;
}
