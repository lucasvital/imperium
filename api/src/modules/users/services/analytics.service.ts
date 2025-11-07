import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repository';
import { BankAccountsRepository } from 'src/shared/database/repositories/bank-accounts.repositories';
import { UsersRepository } from 'src/shared/database/repositories/users.repositories';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly bankAccountsRepo: BankAccountsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async getMentoradosAnalytics(adminId: string, month: number, year: number) {
    // Buscar todos os mentorados
    const mentorados = await this.usersRepo.findMany({
      where: { mentorId: adminId },
      select: { id: true, name: true, email: true },
    });

    // Buscar analytics de cada mentorado
    const analytics = await Promise.all(
      mentorados.map(async (mentorado) => {
        const transactions = await this.transactionsRepo.findMany({
          where: {
            userId: mentorado.id,
            date: {
              gte: new Date(Date.UTC(year, month)),
              lt: new Date(Date.UTC(year, month + 1)),
            },
          },
        });

        const bankAccounts = await this.bankAccountsRepo.findMany({
          where: { userId: mentorado.id },
          include: {
            transactions: {
              select: {
                type: true,
                value: true,
              },
            },
          },
        });

        const totalIncome = transactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.value, 0);

        const totalExpense = transactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.value, 0);

        const totalBalance = bankAccounts.reduce((sum, account) => {
          const accountBalance = account.transactions.reduce(
            (acc, t) => acc + (t.type === 'INCOME' ? t.value : -t.value),
            0,
          );
          return sum + account.initialBalance + accountBalance;
        }, 0);

        return {
          userId: mentorado.id,
          userName: mentorado.name,
          userEmail: mentorado.email,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          totalBalance,
          transactionsCount: transactions.length,
          accountsCount: bankAccounts.length,
        };
      }),
    );

    return analytics;
  }
}


