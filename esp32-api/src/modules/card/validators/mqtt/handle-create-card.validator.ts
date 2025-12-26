import { IsString } from 'class-validator';

export class HandleCreateCardValidator {
  @IsString()
  uid: string;
}
