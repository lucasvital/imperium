import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';
import { BankAccountsRepository } from 'src/shared/database/repositories/bank-accounts.repositories';
import { ValidateBankAccountOwnershipService } from './validate-bank-account-ownership.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class BankAccountsService {
  constructor(
    private readonly bankAccountsRepo: BankAccountsRepository,
    private readonly validateBankAccountOwnershipService: ValidateBankAccountOwnershipService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    requestingUserId: string,
    createBankAccountDto: CreateBankAccountDto,
    targetUserId?: string,
  ) {
    const { name, initialBalance, color, type } = createBankAccountDto;

    const effectiveUserId = targetUserId || requestingUserId;

    // Se está criando para outro usuário, verificar permissão
    if (targetUserId && targetUserId !== requestingUserId) {
      const canAccess = await this.usersService.canAccessUserData(
        requestingUserId,
        targetUserId,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You do not have permission to create bank accounts for this user.',
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

    return this.bankAccountsRepo.create({
      data: {
        userId: effectiveUserId,
        color,
        initialBalance,
        name,
        type,
      },
    });
  }

  async findAllByUserId(
    requestingUserId: string,
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

    const bankAccounts = await this.bankAccountsRepo.findMany({
      where: {
        userId: effectiveUserId,
      },
      include: {
        transactions: {
          select: {
            type: true,
            value: true,
            id: true,
          },
        },
      },
    });

    return bankAccounts.map(({ transactions, ...bankAccount }) => {
      const totalTransactions = transactions.reduce(
        (acc, transaction) =>
          acc +
          (transaction.type === 'INCOME'
            ? transaction.value
            : -transaction.value),
        0,
      );

      const currentBalance = bankAccount.initialBalance + totalTransactions;

      return {
        ...bankAccount,
        currentBalance,
      };
    });
  }

  async update(
    requestingUserId: string,
    bankAccountId: string,
    updateBankAccountDto: UpdateBankAccountDto,
  ) {
    const { name, initialBalance, color, type } = updateBankAccountDto;

    // Buscar a conta para verificar o userId
    const bankAccount = await this.bankAccountsRepo.findFirst({
      where: { id: bankAccountId },
      select: { userId: true },
    });

    if (!bankAccount) {
      throw new ForbiddenException('Bank account not found.');
    }

    // Verificar permissão se não for o próprio usuário
    if (bankAccount.userId !== requestingUserId) {
      const canAccess = await this.usersService.canAccessUserData(
        requestingUserId,
        bankAccount.userId,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You do not have permission to update this bank account.',
        );
      }

      // Verificar se tem permissão FULL_ACCESS
      const targetUser = await this.usersService.getUserById(bankAccount.userId);
      if (targetUser && 'mentorPermission' in targetUser) {
        const mentorPermission = (targetUser as any).mentorPermission;
        if (mentorPermission === 'READ_ONLY') {
          throw new ForbiddenException(
            'You only have read-only access to this user data.',
          );
        }
      }
    }

    this.validateBankAccountOwnershipService.validate(
      bankAccount.userId,
      bankAccountId,
    );

    return this.bankAccountsRepo.update({
      where: { id: bankAccountId },
      data: {
        name,
        initialBalance,
        color,
        type,
      },
    });
  }

  async remove(requestingUserId: string, bankAccountId: string) {
    // Buscar a conta para verificar o userId
    const bankAccount = await this.bankAccountsRepo.findFirst({
      where: { id: bankAccountId },
      select: { userId: true },
    });

    if (!bankAccount) {
      throw new ForbiddenException('Bank account not found.');
    }

    // Verificar permissão se não for o próprio usuário
    if (bankAccount.userId !== requestingUserId) {
      const canAccess = await this.usersService.canAccessUserData(
        requestingUserId,
        bankAccount.userId,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You do not have permission to delete this bank account.',
        );
      }

      // Verificar se tem permissão FULL_ACCESS
      const targetUser = await this.usersService.getUserById(bankAccount.userId);
      if (targetUser && 'mentorPermission' in targetUser) {
        const mentorPermission = (targetUser as any).mentorPermission;
        if (mentorPermission === 'READ_ONLY') {
          throw new ForbiddenException(
            'You only have read-only access to this user data.',
          );
        }
      }
    }

    this.validateBankAccountOwnershipService.validate(
      bankAccount.userId,
      bankAccountId,
    );

    await this.bankAccountsRepo.delete({
      where: {
        id: bankAccountId,
      },
    });

    return null;
  }
}
