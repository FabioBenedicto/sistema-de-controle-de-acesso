import { IsString } from 'class-validator';

export class CreateTeacherValidator {
  @IsString()
  protocol: string;

  @IsString()
  name: string;

  @IsString()
  password: string;
}
