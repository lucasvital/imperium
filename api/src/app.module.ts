import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { CategoriesModule } from './modules/categories/categories.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    BankAccountsModule,
    TransactionsModule,
    BudgetsModule,
    NotificationsModule,
    RecurringTransactionsModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
