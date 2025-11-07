import { Budget } from './budget';

export interface Notification {
  id: string;
  userId: string;
  budgetId?: string;
  type: 'BUDGET_NEAR_LIMIT' | 'BUDGET_EXCEEDED' | 'BUDGET_GOAL_REACHED';
  message: string;
  read: boolean;
  createdAt: string;
  budget?: Budget;
}


