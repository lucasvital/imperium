import { Module } from '@nestjs/common';
import { RecurringTransactionsService } from './services/recurring-transactions.service';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { ValidateRecurringTransactionOwnershipService } from './services/validate-recurring-transaction-ownership.service';
import { CategoriesModule } from '../categories/categories.module';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';

@Module({
  imports: [CategoriesModule, BankAccountsModule],
  controllers: [RecurringTransactionsController],
  providers: [
    RecurringTransactionsService,
    ValidateRecurringTransactionOwnershipService,
  ],
  exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}

