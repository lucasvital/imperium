import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsPositive,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { TransactionType } from '../../transactions/entities/Transaction';
import { RecurringFrequency } from '@prisma/client';

export class CreateRecurringTransactionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  value: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsNotEmpty()
  bankAccountId: string;

  @IsEnum(RecurringFrequency)
  @IsNotEmpty()
  frequency: RecurringFrequency;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsNotEmpty()
  nextDueDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

