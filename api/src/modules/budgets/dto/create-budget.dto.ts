import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(11)
  month: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  year: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  limit: number;

  @IsString()
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

