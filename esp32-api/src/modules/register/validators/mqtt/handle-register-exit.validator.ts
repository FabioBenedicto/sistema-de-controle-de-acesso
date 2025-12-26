import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class HandleRegisterExitValidator {
  @IsNumber()
  classroom_id: number;

  @IsString()
  card_uid: string;

  @IsDate()
  @Type(() => Date)
  exit_datetime: Date;
}
