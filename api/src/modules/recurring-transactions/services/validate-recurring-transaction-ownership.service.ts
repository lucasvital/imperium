import { Injectable, NotFoundException } from '@nestjs/common';
import { RecurringTransactionsRepository } from 'src/shared/database/repositories/recurring-transactions.repository';

@Injectable()
export class ValidateRecurringTransactionOwnershipService {
  constructor(
    private readonly recurringTransactionsRepo: RecurringTransactionsRepository,
  ) {}

  async validate(userId: string, recurringTransactionId: string) {
    const recurringTransaction =
      await this.recurringTransactionsRepo.findUnique({
        where: { id: recurringTransactionId },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found.');
    }

    if (recurringTransaction.userId !== userId) {
      throw new NotFoundException('Recurring transaction not found.');
    }

    return recurringTransaction;
  }
}

