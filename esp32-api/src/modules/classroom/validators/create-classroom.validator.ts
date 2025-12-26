import { IsString } from 'class-validator';

export class CreateClassroomValidator {
  @IsString()
  name: string;
}
