import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '@database/prisma.service';

import { IPaginated } from '@models/paginated.model';

import { ICreateReserveDTO } from './dtos/create-reserve.dto';
import { IDeleteReservesDTO } from './dtos/delete-reserve.dto';
import { IListReservesDTO } from './dtos/list-reserves.dto';

import { Reserve } from './reserve';

@Injectable()
export class ReserveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateReserveDTO): Promise<Reserve> {
    const reserve = await this.prisma.reserve.findFirst({
      where: {
        classroom_id: data.classroom_id,
        OR: [
          {
            entry_datetime: {
              gte: data.entry_datetime,
            },
          },
          {
            exit_datetime: {
              lte: data.exit_datetime,
            },
          },
        ],
      },
    });

    if (reserve) {
      throw new ConflictException('Sala já reservada nesse horário');
    }

    return await this.prisma.reserve.create({
      data,
    });
  }

  async delete(data: IDeleteReservesDTO): Promise<void> {
    const reserve = await this.prisma.reserve.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!reserve) {
      throw new Error('Reserva não encontrada');
    }

    const is_not_admin = data.requestor && !data.requestor.is_admin;
    const is_deleting_other_teacher = reserve.teacher_id !== data.requestor?.id;

    if (is_not_admin && is_deleting_other_teacher) {
      throw new Error(
        'Somente um administrador pode deletar reservas de outros professores',
      );
    }

    await this.prisma.reserve.delete({
      where: {
        id: data.id,
      },
    });
  }

  async list({
    limit,
    page = 1,
    ...params
  }: IListReservesDTO): Promise<IPaginated<Reserve>> {
    let teacher_id: number | undefined = undefined;

    if (params.requestor) {
      if (!params.requestor.is_admin) {
        teacher_id = params.requestor.id;
      }
    }

    const offset = limit ? (page - 1) * limit : undefined;

    const query: Prisma.ReserveFindManyArgs = {
      where: {
        teacher_id,
      },
      include: {
        teacher: true,
        classroom: true,
      },
      orderBy: [{ entry_datetime: 'desc' }, { exit_datetime: 'desc' }],
      take: limit,
      skip: offset,
    };

    const [reserves, total] = await this.prisma.$transaction([
      this.prisma.reserve.findMany(query),
      this.prisma.reserve.count({ where: query.where }),
    ]);

    return {
      data: reserves,
      total,
      perPage: limit || reserves.length,
    };
  }

  // async findByEntryDateTime(classroom: string, entry_datetime: Date) {
  //   return await this.prisma.reserve.findFirst({
  //     where: {
  //       classroom: {
  //         mode: 'insensitive',
  //         equals: classroom,
  //       },
  //       entry_datetime,
  //     },
  //     include: {
  //       teacher: true,
  //     },
  //   });
  // }
}
