import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { TransactionType } from '../transactions/entities/Transaction';
import { OptionalParseEnumPipe } from 'src/shared/pipes/OptionalParseEnumPipe';
import { OptionalParseUUIDPipe } from 'src/shared/pipes/OptionalParseUUIDPipe';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('expenses-by-category')
  getExpensesByCategory(
    @ActiveUserId() userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('targetUserId', OptionalParseUUIDPipe) targetUserId?: string,
  ) {
    return this.analyticsService.getExpensesByCategory(
      userId,
      month,
      year,
      targetUserId,
    );
  }

  @Get('income-by-category')
  getIncomeByCategory(
    @ActiveUserId() userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('targetUserId', OptionalParseUUIDPipe) targetUserId?: string,
  ) {
    return this.analyticsService.getIncomeByCategory(
      userId,
      month,
      year,
      targetUserId,
    );
  }

  @Get('monthly-trend')
  getMonthlyTrend(
    @ActiveUserId() userId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('type', new OptionalParseEnumPipe(TransactionType))
    type?: TransactionType,
    @Query('targetUserId', OptionalParseUUIDPipe) targetUserId?: string,
  ) {
    return this.analyticsService.getMonthlyTrend(
      userId,
      year,
      type,
      targetUserId,
    );
  }

  @Get('yearly-summary')
  getYearlySummary(
    @ActiveUserId() userId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('targetUserId', OptionalParseUUIDPipe) targetUserId?: string,
  ) {
    return this.analyticsService.getYearlySummary(userId, year, targetUserId);
  }
}

