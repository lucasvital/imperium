import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { RecurringTransactionsService } from './services/recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { IsPublic } from 'src/shared/decorators/IsPublic';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createDto: CreateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.create(userId, createDto);
  }

  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.recurringTransactionsService.findAllByUserId(userId);
  }

  @Put(':recurringTransactionId')
  update(
    @ActiveUserId() userId: string,
    @Param('recurringTransactionId', ParseUUIDPipe)
    recurringTransactionId: string,
    @Body() updateDto: UpdateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.update(
      userId,
      recurringTransactionId,
      updateDto,
    );
  }

  @Patch(':recurringTransactionId/toggle-active')
  toggleActive(
    @ActiveUserId() userId: string,
    @Param('recurringTransactionId', ParseUUIDPipe)
    recurringTransactionId: string,
  ) {
    return this.recurringTransactionsService.toggleActive(
      userId,
      recurringTransactionId,
    );
  }

  @Post('generate')
  @IsPublic()
  generateTransactions() {
    return this.recurringTransactionsService.generateTransactions();
  }

  @Delete(':recurringTransactionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @ActiveUserId() userId: string,
    @Param('recurringTransactionId', ParseUUIDPipe)
    recurringTransactionId: string,
  ) {
    return this.recurringTransactionsService.remove(
      userId,
      recurringTransactionId,
    );
  }
}

