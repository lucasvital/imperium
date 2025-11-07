import { Module } from '@nestjs/common';
import { BudgetsService } from './services/budgets.service';
import { BudgetsController } from './budgets.controller';
import { CategoriesModule } from '../categories/categories.module';
import { ValidateBudgetOwnershipService } from './services/validate-budget-ownership.service';

@Module({
  imports: [CategoriesModule],
  controllers: [BudgetsController],
  providers: [BudgetsService, ValidateBudgetOwnershipService],
  exports: [BudgetsService],
})
export class BudgetsModule {}

