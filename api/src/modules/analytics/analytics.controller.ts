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

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('expenses-by-category')
  getExpensesByCategory(
    @ActiveUserId() userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.analyticsService.getExpensesByCategory(userId, month, year);
  }

  @Get('income-by-category')
  getIncomeByCategory(
    @ActiveUserId() userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.analyticsService.getIncomeByCategory(userId, month, year);
  }

  @Get('monthly-trend')
  getMonthlyTrend(
    @ActiveUserId() userId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('type', new OptionalParseEnumPipe(TransactionType))
    type?: TransactionType,
  ) {
    return this.analyticsService.getMonthlyTrend(userId, year, type);
  }

  @Get('yearly-summary')
  getYearlySummary(
    @ActiveUserId() userId: string,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.analyticsService.getYearlySummary(userId, year);
  }
}

