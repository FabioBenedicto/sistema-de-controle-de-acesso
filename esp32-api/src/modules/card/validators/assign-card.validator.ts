import { IsNumber } from 'class-validator';

export class AssignCardValidator {
  @IsNumber()
  teacher_id: number;
}
