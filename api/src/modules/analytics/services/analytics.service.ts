import { ForbiddenException, Injectable } from '@nestjs/common';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repository';
import { TransactionType } from '../../transactions/entities/Transaction';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly usersService: UsersService,
  ) {}

  private async resolveEffectiveUserId(
    requestingUserId: string,
    targetUserId?: string,
  ) {
    if (!targetUserId || targetUserId === requestingUserId) {
      return requestingUserId;
    }

    const canAccess = await this.usersService.canAccessUserData(
      requestingUserId,
      targetUserId,
    );

    if (!canAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this user analytics.',
      );
    }

    return targetUserId;
  }

  async getExpensesByCategory(
    requestingUserId: string,
    month: number,
    year: number,
    targetUserId?: string,
  ) {
    const userId = await this.resolveEffectiveUserId(
      requestingUserId,
      targetUserId,
    );

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

    const transactions = await this.transactionsRepo.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Excluir transferências (transações de saída que têm relatedTransactionId)
        relatedTransactionId: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            iconKey: true,
            iconUrl: true,
          },
        },
      },
    });

    // Agrupar por categoria
    const grouped = transactions.reduce((acc, transaction: any) => {
      const categoryId = transaction.categoryId || 'uncategorized';
      const categoryName = transaction.category?.name || 'Sem categoria';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          category: transaction.category,
          total: 0,
        };
      }

      acc[categoryId].total += transaction.value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  async getIncomeByCategory(
    requestingUserId: string,
    month: number,
    year: number,
    targetUserId?: string,
  ) {
    const userId = await this.resolveEffectiveUserId(
      requestingUserId,
      targetUserId,
    );

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

    const transactions = await this.transactionsRepo.findMany({
      where: {
        userId,
        type: TransactionType.INCOME,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Excluir transferências (transações de entrada que têm relatedTransactionId)
        relatedTransactionId: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            iconKey: true,
            iconUrl: true,
          },
        },
      },
    });

    // Agrupar por categoria
    const grouped = transactions.reduce((acc, transaction: any) => {
      const categoryId = transaction.categoryId || 'uncategorized';
      const categoryName = transaction.category?.name || 'Sem categoria';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          category: transaction.category,
          total: 0,
        };
      }

      acc[categoryId].total += transaction.value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  async getMonthlyTrend(
    requestingUserId: string,
    year: number,
    type?: TransactionType,
    targetUserId?: string,
  ) {
    const userId = await this.resolveEffectiveUserId(
      requestingUserId,
      targetUserId,
    );

    const months = [];
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

      const whereClause: any = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (type) {
        whereClause.type = type;
        // Excluir transferências
        whereClause.relatedTransactionId = null;
      } else {
        // Sem filtro de tipo: excluir transferências
        whereClause.OR = [
          { relatedTransactionId: null },
          { type: { not: TransactionType.INCOME } },
        ];
      }

      const transactions = await this.transactionsRepo.findMany({
        where: whereClause,
      });

      // Filtrar transferências manualmente (para o caso sem tipo específico)
      const filtered = transactions.filter((t) => {
        if (!type && t.type === TransactionType.INCOME && t.relatedTransactionId) {
          return false; // Não contar transferências como receitas
        }
        return true;
      });

      const total = filtered.reduce((sum, t) => sum + t.value, 0);

      months.push({
        month,
        total,
      });
    }

    return months;
  }

  async getYearlySummary(
    requestingUserId: string,
    year: number,
    targetUserId?: string,
  ) {
    const userId = await this.resolveEffectiveUserId(
      requestingUserId,
      targetUserId,
    );

    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    // Receitas
    const incomeTransactions = await this.transactionsRepo.findMany({
      where: {
        userId,
        type: TransactionType.INCOME,
        date: {
          gte: startDate,
          lte: endDate,
        },
        relatedTransactionId: null, // Excluir transferências
      },
    });

    // Despesas
    const expenseTransactions = await this.transactionsRepo.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Excluir transferências
        relatedTransactionId: null,
      },
    });

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + t.value,
      0,
    );
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.value, 0);
    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      balance,
      year,
    };
  }
}

