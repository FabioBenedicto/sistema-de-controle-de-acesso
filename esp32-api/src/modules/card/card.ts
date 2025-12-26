import { Teacher } from 'src/modules/teacher/teacher';

export class Card {
  id: number;
  uid: string;

  // Associations
  teacher_id?: number;
  teacher?: Teacher;
}
