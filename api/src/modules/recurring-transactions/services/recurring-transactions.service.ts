import { Injectable } from '@nestjs/common';
import { RecurringTransactionsRepository } from 'src/shared/database/repositories/recurring-transactions.repository';
import { CreateRecurringTransactionDto } from '../dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from '../dto/update-recurring-transaction.dto';
import { ValidateRecurringTransactionOwnershipService } from './validate-recurring-transaction-ownership.service';
import { ValidateCategoryOwnershipService } from '../../categories/services/validate-category-ownership.service';
import { ValidateBankAccountOwnershipService } from '../../bank-accounts/services/validate-bank-account-ownership.service';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repository';
import { RecurringFrequency } from '@prisma/client';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    private readonly recurringTransactionsRepo: RecurringTransactionsRepository,
    private readonly validateRecurringTransactionOwnershipService: ValidateRecurringTransactionOwnershipService,
    private readonly validateCategoryOwnershipService: ValidateCategoryOwnershipService,
    private readonly validateBankAccountOwnershipService: ValidateBankAccountOwnershipService,
    private readonly transactionsRepo: TransactionsRepository,
  ) {}

  async create(userId: string, createDto: CreateRecurringTransactionDto) {
    if (createDto.categoryId) {
      await this.validateCategoryOwnershipService.validate(
        userId,
        createDto.categoryId,
      );
    }

    await this.validateBankAccountOwnershipService.validate(
      userId,
      createDto.bankAccountId,
    );

    return this.recurringTransactionsRepo.create({
      data: {
        userId,
        name: createDto.name,
        value: createDto.value,
        type: createDto.type,
        categoryId: createDto.categoryId || null,
        bankAccountId: createDto.bankAccountId,
        frequency: createDto.frequency,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        nextDueDate: new Date(createDto.nextDueDate),
        isActive: createDto.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            type: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async findAllByUserId(userId: string) {
    return this.recurringTransactionsRepo.findMany({
      where: {
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            type: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        nextDueDate: 'asc',
      },
    });
  }

  async update(
    userId: string,
    recurringTransactionId: string,
    updateDto: UpdateRecurringTransactionDto,
  ) {
    await this.validateRecurringTransactionOwnershipService.validate(
      userId,
      recurringTransactionId,
    );

    if (updateDto.categoryId) {
      await this.validateCategoryOwnershipService.validate(
        userId,
        updateDto.categoryId,
      );
    }

    await this.validateBankAccountOwnershipService.validate(
      userId,
      updateDto.bankAccountId,
    );

    return this.recurringTransactionsRepo.update({
      where: { id: recurringTransactionId },
      data: {
        name: updateDto.name,
        value: updateDto.value,
        type: updateDto.type,
        categoryId: updateDto.categoryId || null,
        bankAccountId: updateDto.bankAccountId,
        frequency: updateDto.frequency,
        startDate: new Date(updateDto.startDate),
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : null,
        nextDueDate: new Date(updateDto.nextDueDate),
        isActive: updateDto.isActive,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            type: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async toggleActive(userId: string, recurringTransactionId: string) {
    const recurringTransaction =
      await this.validateRecurringTransactionOwnershipService.validate(
        userId,
        recurringTransactionId,
      );

    return this.recurringTransactionsRepo.update({
      where: { id: recurringTransactionId },
      data: {
        isActive: !recurringTransaction.isActive,
      },
    });
  }

  async remove(userId: string, recurringTransactionId: string) {
    await this.validateRecurringTransactionOwnershipService.validate(
      userId,
      recurringTransactionId,
    );

    await this.recurringTransactionsRepo.delete({
      where: { id: recurringTransactionId },
    });

    return null;
  }

  async generateTransactions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar transações recorrentes ativas com nextDueDate <= hoje
    const recurringTransactions =
      await this.recurringTransactionsRepo.findMany({
        where: {
          isActive: true,
          nextDueDate: {
            lte: today,
          },
        },
        include: {
          category: true,
          bankAccount: true,
        },
      });

    const results = [];

    for (const recurring of recurringTransactions) {
      // Verificar se endDate foi atingido
      if (recurring.endDate && new Date(recurring.endDate) < today) {
        // Desativar se endDate foi atingido
        await this.recurringTransactionsRepo.update({
          where: { id: recurring.id },
          data: { isActive: false },
        });
        continue;
      }

      // Criar transação normal usando a data atual (não a nextDueDate)
      const transaction = await this.transactionsRepo.create({
        data: {
          userId: recurring.userId,
          bankAccountId: recurring.bankAccountId,
          categoryId: recurring.categoryId,
          name: recurring.name,
          value: recurring.value,
          type: recurring.type,
          date: new Date(), // Usar data atual para a transação criada
        },
      });

      // Calcular próximo nextDueDate baseado na frequência
      const nextDueDate = this.calculateNextDueDate(
        recurring.nextDueDate,
        recurring.frequency,
      );

      // Atualizar nextDueDate
      await this.recurringTransactionsRepo.update({
        where: { id: recurring.id },
        data: { nextDueDate },
      });

      results.push({
        recurringTransactionId: recurring.id,
        transactionId: transaction.id,
      });
    }

    return results;
  }

  private calculateNextDueDate(
    currentDate: Date,
    frequency: RecurringFrequency,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case RecurringFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case RecurringFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurringFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecurringFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }
}

