import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { type Prisma } from '@prisma/client';

@Injectable()
export class BudgetsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.BudgetCreateArgs) {
    return this.prismaService.budget.create(createDto);
  }

  update(updateDto: Prisma.BudgetUpdateArgs) {
    return this.prismaService.budget.update(updateDto);
  }

  delete(deleteDto: Prisma.BudgetDeleteArgs) {
    return this.prismaService.budget.delete(deleteDto);
  }

  findMany(findManyDto: Prisma.BudgetFindManyArgs) {
    return this.prismaService.budget.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.BudgetFindFirstArgs) {
    return this.prismaService.budget.findFirst(findFirstDto);
  }

  findUnique(findUniqueDto: Prisma.BudgetFindUniqueArgs) {
    return this.prismaService.budget.findUnique(findUniqueDto);
  }
}


