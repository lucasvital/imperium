import { Category } from './category';
import { BankAccount } from './bankAccount';

export interface RecurringTransaction {
  id: string;
  userId: string;
  name: string;
  value: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  bankAccountId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  bankAccount?: BankAccount;
}

