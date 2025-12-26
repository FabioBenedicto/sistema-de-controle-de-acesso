import { Classroom, Teacher } from '@prisma/client';

export class Reserve {
  id: number;
  entry_datetime: Date;
  exit_datetime: Date;
  created_at: Date;

  // Associations
  classroom_id: number;
  classroom?: Classroom;

  teacher_id: number;
  teacher?: Teacher;
}
