import { Teacher } from '@prisma/client';

export interface IDeleteReservesDTO {
  id: number;
  requestor?: Teacher;
}
