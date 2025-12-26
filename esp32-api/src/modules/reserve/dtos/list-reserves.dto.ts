import { Teacher } from '@prisma/client';

export interface IListReservesDTO {
  limit?: number;
  page?: number;
  requestor?: Teacher;
}
