import { Injectable, NotFoundException } from '@nestjs/common';
import { BudgetsRepository } from 'src/shared/database/repositories/budgets.repository';

@Injectable()
export class ValidateBudgetOwnershipService {
  constructor(private readonly budgetsRepo: BudgetsRepository) {}

  async validate(userId: string, budgetId: string) {
    const budget = await this.budgetsRepo.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found.');
    }

    if (budget.userId !== userId) {
      throw new NotFoundException('Budget not found.');
    }

    return budget;
  }
}


