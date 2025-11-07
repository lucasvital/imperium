import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { type Prisma } from '@prisma/client';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.TransactionCreateArgs) {
    return this.prismaService.transaction.create(createDto);
  }

  createMany(createManyDto: Prisma.TransactionCreateManyArgs) {
    return this.prismaService.transaction.createMany(createManyDto);
  }

  update(updateDto: Prisma.TransactionUpdateArgs) {
    return this.prismaService.transaction.update(updateDto);
  }

  delete(deleteDto: Prisma.TransactionDeleteArgs) {
    return this.prismaService.transaction.delete(deleteDto);
  }

  deleteMany(deleteManyDto: Prisma.TransactionDeleteManyArgs) {
    return this.prismaService.transaction.deleteMany(deleteManyDto);
  }

  findMany(findManyDto: Prisma.TransactionFindManyArgs) {
    return this.prismaService.transaction.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.TransactionFindFirstArgs) {
    return this.prismaService.transaction.findFirst(findFirstDto);
  }

  findUnique(findUniqueDto: Prisma.TransactionFindUniqueArgs) {
    return this.prismaService.transaction.findUnique(findUniqueDto);
  }
}
