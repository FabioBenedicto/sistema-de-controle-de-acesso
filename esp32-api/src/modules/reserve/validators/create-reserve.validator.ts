import { Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class CreateReserveValidator {
  @IsNumber()
  classroom_id: number;

  @IsNumber()
  teacher_id: number;

  @IsDate()
  @Type(() => Date)
  entry_datetime: Date;

  @IsDate()
  @Type(() => Date)
  exit_datetime: Date;
}
