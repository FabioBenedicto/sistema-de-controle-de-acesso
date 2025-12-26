import { IsString } from 'class-validator';

export class CreateSessionValidator {
  @IsString()
  protocol: string;

  @IsString()
  password: string;
}
