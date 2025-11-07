import { Category } from './category';

export interface Budget {
  id: string;
  userId: string;
  categoryId?: string;
  month: number;
  year: number;
  limit: number;
  spent?: number;
  remaining?: number;
  percentage?: number;
  isIncome?: boolean;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}


