import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repository';
import { ValidateBankAccountOwnershipService } from '../../bank-accounts/services/validate-bank-account-ownership.service';
import { ValidateCategoryOwnershipService } from '../../categories/services/validate-category-ownership.service';
import { ValidateTransactionOwnershipService } from './validate-transaction-ownership.service';
import { TransactionType } from '../entities/Transaction';
import { UsersService } from '../../users/users.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly validateTransactionOwnershipService: ValidateTransactionOwnershipService,
    private readonly validateCategoryOwnershipService: ValidateCategoryOwnershipService,
    private readonly validateBankAccountOwnershipService: ValidateBankAccountOwnershipService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    requestingUserId: string,
    createTransactionDto: CreateTransactionDto,
    targetUserId?: string,
  ) {
    const {
      bankAccountId,
      categoryId,
      date,
      name,
      type,
      value,
      toBankAccountId,
      installments,
      totalValue,
      firstInstallmentDate,
    } = createTransactionDto;

    const effectiveUserId = targetUserId || requestingUserId;

    // Se está criando para outro usuário, verificar permissão
    if (targetUserId && targetUserId !== requestingUserId) {
      const canAccess = await this.usersService.canAccessUserData(
        requestingUserId,
        targetUserId,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You do not have permission to create transactions for this user.',
        );
      }

      // Verificar se tem permissão FULL_ACCESS
      const targetUser = await this.usersService.getUserById(targetUserId);
      if (targetUser && 'mentorPermission' in targetUser) {
        const mentorPermission = (targetUser as any).mentorPermission;
        if (mentorPermission === 'READ_ONLY') {
          throw new ForbiddenException(
            'You only have read-only access to this user data.',
          );
        }
      }
    }

    // Se for transferência, criar duas transações vinculadas
    const totalInstallments = installments && installments > 0 ? installments : 1;

    if (type === TransactionType.TRANSFER) {
      if (totalInstallments > 1) {
        throw new ForbiddenException(
          'Transfers cannot be created with installments.',
        );
      }

      if (!toBankAccountId) {
        throw new ForbiddenException(
          'toBankAccountId is required for TRANSFER transactions.',
        );
      }

      if (bankAccountId === toBankAccountId) {
        throw new ForbiddenException(
          'Source and destination accounts must be different.',
        );
      }

      // Validar que ambas as contas pertencem ao usuário
      await this.validateBankAccountOwnershipService.validate(
        effectiveUserId,
        bankAccountId,
      );
      await this.validateBankAccountOwnershipService.validate(
        effectiveUserId,
        toBankAccountId,
      );

      // Criar transação de saída (EXPENSE) na conta origem
      const outgoingTransaction = await this.transactionsRepo.create({
        data: {
          userId: effectiveUserId,
          bankAccountId,
          categoryId: null, // Transferências não têm categoria
          date,
          name: `Transferência: ${name}`,
          type: TransactionType.EXPENSE,
          value,
        },
      });

      // Criar transação de entrada (INCOME) na conta destino
      const incomingTransaction = await this.transactionsRepo.create({
        data: {
          userId: effectiveUserId,
          bankAccountId: toBankAccountId,
          categoryId: null,
          date,
          name: `Transferência: ${name}`,
          type: TransactionType.INCOME,
          value,
          relatedTransactionId: outgoingTransaction.id,
        },
      });

      // Vincular a transação de saída com a de entrada
      await this.transactionsRepo.update({
        where: { id: outgoingTransaction.id },
        data: { relatedTransactionId: incomingTransaction.id },
      });

      return outgoingTransaction;
    }

    // Para transações normais (INCOME/EXPENSE)
    await this.validateEntitiesOwnership({
      userId: effectiveUserId,
      bankAccountId,
      categoryId: categoryId || '',
    });

    if (totalInstallments > 1) {
      const groupId = randomUUID();
      const normalizedCategoryId = categoryId ?? null;
      const initialDate = firstInstallmentDate
        ? new Date(firstInstallmentDate)
        : new Date(date);
      initialDate.setHours(0, 0, 0, 0);

      const normalizedTotalValue =
        totalValue && totalValue > 0 ? totalValue : value * totalInstallments;

      const totalCents = Math.round(normalizedTotalValue * 100);
      const baseCents = Math.floor(totalCents / totalInstallments);
      const remainder = totalCents - baseCents * totalInstallments;

      const data = Array.from({ length: totalInstallments }).map((_, index) => {
        const cents = baseCents + (index < remainder ? 1 : 0);
        const installmentValue = cents / 100;
        const installmentDate = this.addMonths(initialDate, index);

        return {
          userId: effectiveUserId,
          bankAccountId,
          categoryId: normalizedCategoryId,
          date: installmentDate,
          name: `${name} (${index + 1}/${totalInstallments})`,
          type,
          value: installmentValue,
          installmentGroupId: groupId,
          installmentNumber: index + 1,
          totalInstallments,
          installmentTotalValue: normalizedTotalValue,
        };
      });

      await this.transactionsRepo.createMany({
        data,
      });

      return this.transactionsRepo.findFirst({
        where: {
          installmentGroupId: groupId,
        },
        orderBy: {
          installmentNumber: 'asc',
        },
      });
    }

    return this.transactionsRepo.create({
      data: {
        userId: effectiveUserId,
        bankAccountId,
        categoryId,
        date,
        name,
        type,
        value,
      },
    });
  }

  async findAllByUserId(
    requestingUserId: string,
    filters: {
      month: number;
      year: number;
      bankAccountId?: string;
      type?: TransactionType;
      name?: string;
      minValue?: number;
      maxValue?: number;
      categoryIds?: string[];
      startDate?: string;
      endDate?: string;
    },
    targetUserId?: string,
  ) {
    // Se targetUserId foi fornecido, validar acesso
    const effectiveUserId = targetUserId || requestingUserId;

    if (targetUserId && targetUserId !== requestingUserId) {
      const canAccess = await this.usersService.canAccessUserData(
        requestingUserId,
        targetUserId,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You do not have permission to access this user data.',
        );
      }
    }

    // Construir filtro de data
    let dateFilter: any = {};
    
    // Se startDate e endDate foram fornecidos, usar período customizado
    if (filters.startDate && filters.endDate) {
      dateFilter = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    } else {
      // Caso contrário, usar o filtro de mês/ano padrão
      dateFilter = {
        gte: new Date(Date.UTC(filters.year, filters.month)),
        lt: new Date(Date.UTC(filters.year, filters.month + 1)),
      };
    }

    // Filtrar transferências: excluir transações de entrada (INCOME) que fazem parte de uma transferência
    // (ou seja, que têm relatedTransactionId não nulo)
    const whereClause: any = {
      userId: effectiveUserId,
      bankAccountId: filters.bankAccountId,
      date: dateFilter,
    };

    // Filtro por nome (busca parcial, case-insensitive)
    if (filters.name) {
      whereClause.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    // Filtro por valor mínimo
    if (filters.minValue !== undefined) {
      whereClause.value = {
        ...whereClause.value,
        gte: filters.minValue,
      };
    }

    // Filtro por valor máximo
    if (filters.maxValue !== undefined) {
      whereClause.value = {
        ...whereClause.value,
        lte: filters.maxValue,
      };
    }

    // Filtro por categorias
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      whereClause.categoryId = {
        in: filters.categoryIds,
      };
    }

    // Se filtrar por tipo, aplicar o filtro
    if (filters.type === TransactionType.TRANSFER) {
      // Para transferências, mostrar apenas as de saída (EXPENSE) que têm relatedTransactionId
      whereClause.type = TransactionType.EXPENSE;
      whereClause.relatedTransactionId = { not: null };
    } else if (filters.type) {
      // Para outros tipos, aplicar o filtro e excluir transações de entrada que são parte de transferências
      whereClause.type = filters.type;
      // Excluir transações de entrada que são parte de uma transferência
      if (filters.type === TransactionType.INCOME) {
        whereClause.relatedTransactionId = null;
      }
    } else {
      // Sem filtro de tipo: excluir transações de entrada que são parte de uma transferência
      whereClause.OR = [
        { relatedTransactionId: null },
        { type: { not: TransactionType.INCOME } },
      ];
    }

    return this.transactionsRepo.findMany({
      where: whereClause,
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
        relatedTransaction: {
          select: {
            id: true,
            bankAccountId: true,
            bankAccount: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async update(
    requestingUserId: string,
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { bankAccountId, categoryId, date, name, type, value } =
      updateTransactionDto;

    // Buscar a transação completa para verificar se é transferência
    const transaction = await this.transactionsRepo.findFirst({
      where: { id: transactionId },
      select: {
        userId: true,
        relatedTransactionId: true,
        type: true,
        installmentGroupId: true,
      },
    });

    if (!transaction) {
      throw new ForbiddenException('Transaction not found.');
    }

    // Verificar permissão se não for o próprio usuário
    if (transaction.userId !== requestingUserId) {
      const canAccess = await this.usersService.canAccessUserData(
        requestingUserId,
        transaction.userId,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You do not have permission to update this transaction.',
        );
      }

      // Verificar se tem permissão FULL_ACCESS
      const targetUser = await this.usersService.getUserById(transaction.userId);
      if (targetUser && 'mentorPermission' in targetUser) {
        const mentorPermission = (targetUser as any).mentorPermission;
        if (mentorPermission === 'READ_ONLY') {
          throw new ForbiddenException(
            'You only have read-only access to this user data.',
          );
        }
      }
    }

    // Se é uma transferência (tem relatedTransactionId), atualizar ambas as transações
    if (transaction.relatedTransactionId) {
      // Buscar a transação relacionada
      const relatedTransaction = await this.transactionsRepo.findUnique({
        where: { id: transaction.relatedTransactionId },
        select: { bankAccountId: true },
      });

      if (!relatedTransaction) {
        throw new ForbiddenException('Related transaction not found.');
      }

      // Atualizar transação de saída
      await this.validateBankAccountOwnershipService.validate(
        transaction.userId,
        bankAccountId,
      );

      await this.transactionsRepo.update({
        where: { id: transactionId },
        data: {
          name: `Transferência: ${name}`,
          date,
          value,
          bankAccountId,
          categoryId: null, // Transferências não têm categoria
        },
      });

      // Atualizar transação de entrada
      await this.validateBankAccountOwnershipService.validate(
        transaction.userId,
        relatedTransaction.bankAccountId,
      );

      await this.transactionsRepo.update({
        where: { id: transaction.relatedTransactionId },
        data: {
          name: `Transferência: ${name}`,
          date,
          value,
        },
      });

      return this.transactionsRepo.findUnique({
        where: { id: transactionId },
        include: {
          category: true,
          relatedTransaction: {
            include: {
              bankAccount: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    }

    if (transaction.installmentGroupId) {
      throw new ForbiddenException(
        'Installment transactions cannot be edited individually.',
      );
    }

    // Para transações normais
    await this.validateEntitiesOwnership({
      userId: transaction.userId,
      bankAccountId,
      categoryId,
      transactionId,
    });

    return this.transactionsRepo.update({
      where: {
        id: transactionId,
      },
      data: {
        name,
        date,
        type,
        value,
        bankAccountId,
        categoryId,
      },
    });
  }

  async remove(requestingUserId: string, transactionId: string) {
    // Buscar a transação para verificar se é transferência
    const transaction = await this.transactionsRepo.findFirst({
      where: { id: transactionId },
      select: {
        userId: true,
        relatedTransactionId: true,
        installmentGroupId: true,
      },
    });

    if (!transaction) {
      throw new ForbiddenException('Transaction not found.');
    }

    // Verificar permissão se não for o próprio usuário
    if (transaction.userId !== requestingUserId) {
      const canAccess = await this.usersService.canAccessUserData(
        requestingUserId,
        transaction.userId,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You do not have permission to delete this transaction.',
        );
      }

      // Verificar se tem permissão FULL_ACCESS
      const targetUser = await this.usersService.getUserById(transaction.userId);
      if (targetUser && 'mentorPermission' in targetUser) {
        const mentorPermission = (targetUser as any).mentorPermission;
        if (mentorPermission === 'READ_ONLY') {
          throw new ForbiddenException(
            'You only have read-only access to this user data.',
          );
        }
      }
    }

    await this.validateTransactionOwnershipService.validate(
      transaction.userId,
      transactionId,
    );

    // Verificar se existe uma transação que referencia esta (ou seja, esta é a de saída)
    const relatedOutgoingTransaction = await this.transactionsRepo.findFirst({
      where: { relatedTransactionId: transactionId },
      select: { id: true },
    });

    if (transaction.installmentGroupId) {
      await this.transactionsRepo.deleteMany({
        where: { installmentGroupId: transaction.installmentGroupId },
      });

      return null;
    }

    // Se é a transação de saída de uma transferência (tem relatedTransactionId não nulo)
    if (transaction.relatedTransactionId) {
      // Deletar transação de entrada primeiro
      await this.transactionsRepo.delete({
        where: { id: transaction.relatedTransactionId },
      });
    }

    // Se existe uma transação que referencia esta (esta é a de entrada, mas a query acima não encontra)
    // Na verdade, se relatedOutgoingTransaction existe, esta é a transação de entrada
    // então precisamos deletar a de saída também
    if (relatedOutgoingTransaction) {
      await this.transactionsRepo.delete({
        where: { id: relatedOutgoingTransaction.id },
      });
      return null;
    }

    // Deletar transação
    await this.transactionsRepo.delete({
      where: {
        id: transactionId,
      },
    });

    return null;
  }

  private async validateEntitiesOwnership({
    userId,
    bankAccountId,
    categoryId,
    transactionId,
  }: {
    userId: string;
    bankAccountId: string;
    categoryId: string;
    transactionId?: string;
  }) {
    await Promise.all([
      transactionId &&
        this.validateTransactionOwnershipService.validate(
          userId,
          transactionId,
        ),
      this.validateBankAccountOwnershipService.validate(userId, bankAccountId),
      this.validateCategoryOwnershipService.validate(userId, categoryId),
    ]);
  }

  private addMonths(date: Date, months: number) {
    const result = new Date(date.getTime());
    const desiredDay = date.getDate();

    result.setMonth(result.getMonth() + months);

    if (result.getDate() < desiredDay) {
      result.setDate(0);
    }

    return result;
  }
}
