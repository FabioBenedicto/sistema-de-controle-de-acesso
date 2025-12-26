import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class ListRegistersValidator {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  teacher_id?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  classroom_id?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
