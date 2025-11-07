import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number;
}


