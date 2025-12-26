import { Teacher } from 'src/modules/teacher/teacher';

import { Classroom } from '@prisma/client';

export class Register {
  id: number;
  entry_datetime: Date;
  exit_datetime?: Date;

  // Associations
  classroom_id?: number;
  classroom?: Classroom;

  teacher_id?: number;
  teacher?: Teacher;
}
