import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class HandleRegisterEntryValidator {
  @IsNumber()
  classroom_id: number;

  @IsString()
  card_uid: string;

  @IsDate()
  @Type(() => Date)
  entry_datetime: Date;
}
