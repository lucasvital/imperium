import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsPositive,
  IsDateString,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsInt,
  Min,
} from 'class-validator';
import { TransactionType } from '../entities/Transaction';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  bankAccountId: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  value: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => o.type === TransactionType.TRANSFER)
  @IsNotEmpty({ message: 'toBankAccountId is required when type is TRANSFER' })
  toBankAccountId?: string;

  @IsOptional()
  @ValidateIf((o) => o.type !== TransactionType.TRANSFER)
  @IsInt()
  @Min(1)
  installments?: number;

  @IsOptional()
  @ValidateIf((o) => o.installments && o.installments > 1)
  @IsNumber()
  @IsPositive()
  totalValue?: number;

  @IsOptional()
  @ValidateIf((o) => o.installments && o.installments > 1)
  @IsDateString()
  firstInstallmentDate?: string;
}
