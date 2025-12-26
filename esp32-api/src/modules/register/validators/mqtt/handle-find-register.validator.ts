import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class HandleFindRegisterValidator {
  @IsString()
  classroom: string;

  @IsDate()
  @Type(() => Date)
  date: Date;
}
