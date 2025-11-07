import { Module } from '@nestjs/common';
import { BankAccountsService } from './services/bank-accounts.service';
import { BankAccountsController } from './bank-accounts.controller';
import { ValidateBankAccountOwnershipService } from './services/validate-bank-account-ownership.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  exports: [ValidateBankAccountOwnershipService],
  controllers: [BankAccountsController],
  providers: [BankAccountsService, ValidateBankAccountOwnershipService],
})
export class BankAccountsModule {}
