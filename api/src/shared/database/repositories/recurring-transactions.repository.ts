import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { type Prisma } from '@prisma/client';

@Injectable()
export class RecurringTransactionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.RecurringTransactionCreateArgs) {
    return this.prismaService.recurringTransaction.create(createDto);
  }

  update(updateDto: Prisma.RecurringTransactionUpdateArgs) {
    return this.prismaService.recurringTransaction.update(updateDto);
  }

  delete(deleteDto: Prisma.RecurringTransactionDeleteArgs) {
    return this.prismaService.recurringTransaction.delete(deleteDto);
  }

  findMany(findManyDto: Prisma.RecurringTransactionFindManyArgs) {
    return this.prismaService.recurringTransaction.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.RecurringTransactionFindFirstArgs) {
    return this.prismaService.recurringTransaction.findFirst(findFirstDto);
  }

  findUnique(findUniqueDto: Prisma.RecurringTransactionFindUniqueArgs) {
    return this.prismaService.recurringTransaction.findUnique(findUniqueDto);
  }
}

