import { Reserve } from '@prisma/client';

import { Register } from '../register/registers';

export class Teacher {
  id: number;
  protocol: string;
  password: string;
  name: string;
  is_admin?: boolean;
  token?: string;

  // Associations
  registers?: Register[];
  reserves?: Reserve[];
}
