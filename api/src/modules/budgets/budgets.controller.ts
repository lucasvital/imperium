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
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BudgetsService } from './services/budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(userId, createBudgetDto);
  }

  @Get()
  findAll(
    @ActiveUserId() userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.budgetsService.findAllByUserId(userId, { month, year });
  }

  @Put(':budgetId')
  update(
    @ActiveUserId() userId: string,
    @Param('budgetId', ParseUUIDPipe) budgetId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(userId, budgetId, updateBudgetDto);
  }

  @Delete(':budgetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @ActiveUserId() userId: string,
    @Param('budgetId', ParseUUIDPipe) budgetId: string,
  ) {
    return this.budgetsService.remove(userId, budgetId);
  }
}


