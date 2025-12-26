import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { IPaginated } from '@common/models/paginated.model';

import { IListRegistersDTO } from './dtos/list-registers.dto';
import { IRegisterEntryDTO } from './dtos/register-entry.dto';
import { IRegisterExitDTO } from './dtos/register-exit.dto';

import { PrismaService } from '@common/database/prisma.service';

import { Register } from './registers';

@Injectable()
export class RegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async registerEntry(data: IRegisterEntryDTO): Promise<Register> {
    const existing_reserve = await this.prisma.reserve.findFirst({
      where: {
        classroom_id: data.classroom_id,
        OR: [
          {
            entry_datetime: {
              lte: data.entry_datetime,
            },
            exit_datetime: {
              gte: data.entry_datetime,
            },
          },
        ],
        teacher_id: {
          not: data.teacher_id,
        },
      },
    });

    if (existing_reserve) {
      throw new ConflictException('Sala reservada');
    }

    const existing_entry = await this.prisma.register.findFirst({
      where: {
        entry_datetime: data.entry_datetime,
        classroom_id: data.classroom_id,
      },
    });

    if (existing_entry) {
      throw new ConflictException('Sala ocupada');
    }

    return await this.prisma.register.create({
      data,
      include: {
        teacher: true,
        classroom: true,
      },
    });
  }

  async registerExit(data: IRegisterExitDTO): Promise<Register> {
    const existing_entry = await this.prisma.register.findFirst({
      where: {
        classroom_id: data.classroom_id,
        teacher_id: data.teacher_id,
        exit_datetime: null,
      },
    });

    if (!existing_entry) {
      throw new ConflictException('O professor não entrou nessa sala');
    }

    return await this.prisma.register.update({
      where: {
        id: existing_entry.id,
      },
      data,
    });
  }

  async findOccupantByClassroomId(classroom_id: number) {
    const register = await this.prisma.register.findFirst({
      where: {
        exit_datetime: null,
        classroom_id: classroom_id,
      },
      include: {
        teacher: true,
      },
    });

    if (!register) {
      throw new NotFoundException('Sala livre');
    }

    return register;
  }

  async list({
    limit,
    page = 1,
    ...options
  }: IListRegistersDTO): Promise<IPaginated<Register>> {
    const offset = limit ? (page - 1) * limit : undefined;

    const query: Prisma.RegisterFindManyArgs = {
      where: {
        classroom_id: options.classroom_id,
        teacher_id: options.teacher_id,
      },
      include: {
        teacher: true,
        classroom: true,
      },
      orderBy: [
        { entry_datetime: 'desc' },
        {
          exit_datetime: {
            nulls: 'first',
            sort: 'desc',
          },
        },
      ],
      take: limit,
      skip: offset,
    };

    const [registers, total] = await this.prisma.$transaction([
      this.prisma.register.findMany(query),
      this.prisma.register.count({ where: query.where }),
    ]);

    return {
      data: registers,
      total,
      perPage: limit || registers.length,
    };
  }
}
