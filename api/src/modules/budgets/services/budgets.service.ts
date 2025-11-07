import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { BudgetsRepository } from 'src/shared/database/repositories/budgets.repository';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { ValidateBudgetOwnershipService } from './validate-budget-ownership.service';
import { ValidateCategoryOwnershipService } from '../../categories/services/validate-category-ownership.service';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repository';
import { TransactionType } from '../../transactions/entities/Transaction';
import { NotificationsRepository } from 'src/shared/database/repositories/notifications.repository';
import { NotificationType } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly budgetsRepo: BudgetsRepository,
    private readonly validateBudgetOwnershipService: ValidateBudgetOwnershipService,
    private readonly validateCategoryOwnershipService: ValidateCategoryOwnershipService,
    private readonly transactionsRepo: TransactionsRepository,
    private readonly notificationsRepo: NotificationsRepository,
  ) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    // Se categoryId foi fornecido, validar que a categoria pertence ao usuário
    if (createBudgetDto.categoryId) {
      await this.validateCategoryOwnershipService.validate(
        userId,
        createBudgetDto.categoryId,
      );
    }

    // Verificar se já existe um orçamento para o mesmo mês/ano/categoria
    const existingBudget = await this.budgetsRepo.findFirst({
      where: {
        userId,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
        categoryId: createBudgetDto.categoryId || null,
      },
    });

    if (existingBudget) {
      throw new ConflictException(
        'Budget already exists for this month, year and category.',
      );
    }

    return this.budgetsRepo.create({
      data: {
        userId,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
        limit: createBudgetDto.limit,
        categoryId: createBudgetDto.categoryId || null,
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
      },
    });
  }

  async findAllByUserId(
    userId: string,
    filters: { month: number; year: number },
  ) {
    const budgets = await this.budgetsRepo.findMany({
      where: {
        userId,
        month: filters.month,
        year: filters.year,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular gastos/receitas para cada orçamento
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget: any) => {
        const startDate = new Date(Date.UTC(filters.year, filters.month));
        const endDate = new Date(Date.UTC(filters.year, filters.month + 1));

        // Determinar o tipo de transação baseado na categoria
        // Se não tem categoria, assume despesa (orçamento geral de despesas)
        let transactionType = TransactionType.EXPENSE;
        if (budget.categoryId && budget.category) {
          transactionType = budget.category.type;
        }

        const whereClause: any = {
          userId,
          type: transactionType,
          date: {
            gte: startDate,
            lt: endDate,
          },
        };

        // Se o orçamento é para uma categoria específica, filtrar por ela
        if (budget.categoryId) {
          whereClause.categoryId = budget.categoryId;
        }

        // Para orçamentos de receita (investimentos), considerar apenas transações em contas de investimento
        if (transactionType === TransactionType.INCOME) {
          whereClause.bankAccount = {
            type: 'INVESTMENT',
          };
        }

        const transactions = await this.transactionsRepo.findMany({
          where: whereClause,
        });

        const amount = transactions.reduce((sum, transaction) => sum + transaction.value, 0);

        // Para receitas, a lógica é invertida: queremos atingir ou ultrapassar a meta
        const isIncome = transactionType === TransactionType.INCOME;
        const remaining = isIncome 
          ? amount - budget.limit  // Para receitas: quanto ultrapassou a meta (positivo = bom)
          : budget.limit - amount; // Para despesas: quanto resta (positivo = bom)
        
        const percentage = isIncome
          ? (amount / budget.limit) * 100  // Para receitas: % da meta atingida
          : (amount / budget.limit) * 100; // Para despesas: % do limite usado

        // Criar notificações baseado no status do orçamento
        await this.checkAndCreateNotifications(
          userId,
          budget.id,
          isIncome,
          percentage,
          budget,
        );

        return {
          ...budget,
          spent: amount, // Mantém o nome "spent" mas pode ser receita também
          remaining,
          percentage,
          isIncome,
        };
      }),
    );

    return budgetsWithSpent;
  }

  private async checkAndCreateNotifications(
    userId: string,
    budgetId: string,
    isIncome: boolean,
    percentage: number,
    budget: any,
  ) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Verificar se o orçamento é do mês atual
    if (budget.month !== currentMonth || budget.year !== currentYear) {
      return;
    }

    if (isIncome) {
      // Para receitas: notificar quando meta é atingida (100%)
      if (percentage >= 100) {
        await this.createNotificationIfNotExists(
          userId,
          budgetId,
          NotificationType.BUDGET_GOAL_REACHED,
          `Meta de receita atingida! Você recebeu ${percentage.toFixed(1)}% da sua meta.`,
          budget,
        );
      }
    } else {
      // Para despesas: notificar quando atinge 80% do limite
      if (percentage >= 80 && percentage < 100) {
        await this.createNotificationIfNotExists(
          userId,
          budgetId,
          NotificationType.BUDGET_NEAR_LIMIT,
          `Atenção! Você já gastou ${percentage.toFixed(1)}% do seu orçamento.`,
          budget,
        );
      }

      // Para despesas: notificar quando ultrapassa 100%
      if (percentage > 100) {
        await this.createNotificationIfNotExists(
          userId,
          budgetId,
          NotificationType.BUDGET_EXCEEDED,
          `Orçamento ultrapassado! Você gastou ${percentage.toFixed(1)}% do limite definido.`,
          budget,
        );
      }
    }
  }

  private async createNotificationIfNotExists(
    userId: string,
    budgetId: string,
    type: NotificationType,
    message: string,
    budget: any,
  ) {
    const startOfMonth = new Date(budget.year, budget.month, 1);
    const endOfMonth = new Date(budget.year, budget.month + 1, 0, 23, 59, 59, 999);

    // Verificar se já existe uma notificação do mesmo tipo para este orçamento no mês
    const existingNotification = await this.notificationsRepo.findFirst({
      where: {
        userId,
        budgetId,
        type,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (!existingNotification) {
      await this.notificationsRepo.create({
        data: {
          userId,
          budgetId,
          type,
          message,
        },
      });
    }
  }

  async update(
    userId: string,
    budgetId: string,
    updateBudgetDto: UpdateBudgetDto,
  ) {
    await this.validateBudgetOwnershipService.validate(userId, budgetId);

    return this.budgetsRepo.update({
      where: { id: budgetId },
      data: updateBudgetDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            type: true,
          },
        },
      },
    });
  }

  async remove(userId: string, budgetId: string) {
    await this.validateBudgetOwnershipService.validate(userId, budgetId);

    await this.budgetsRepo.delete({
      where: { id: budgetId },
    });
  }
}


