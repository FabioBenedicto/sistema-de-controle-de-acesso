import { Reserve } from '../reserve/reserve';

export class Classroom {
  id: number;
  name: string;

  // Associations
  reserves?: Reserve[];
}
