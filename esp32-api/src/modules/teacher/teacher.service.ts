import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '@database/prisma.service';

import { IPaginated } from '@models/paginated.model';

import { CreateTeacherDTO } from './dtos/create-teacher.dto';
import { IListTeachersDTO } from './dtos/list-teachers.dto';

import { Teacher } from './teacher';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTeacherDTO): Promise<Teacher> {
    const existing_protocol_teacher = await this.prisma.teacher.findUnique({
      where: {
        protocol: data.protocol,
      },
    });

    if (existing_protocol_teacher) {
      throw new ConflictException('Um professor com esse protocolo já existe');
    }

    return await this.prisma.teacher.create({
      data,
    });
  }

  async delete(id: number): Promise<void> {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Professor não encontrado');
    }

    await this.prisma.teacher.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: number): Promise<Teacher> {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Professor não encontrado');
    }

    return teacher;
  }

  async findProtocol(protocol: string): Promise<Teacher | null> {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        protocol,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Professor não encontrado');
    }

    return teacher;
  }

  async list({
    limit,
    page = 1,
  }: IListTeachersDTO): Promise<IPaginated<Teacher>> {
    const offset = limit ? (page - 1) * limit : undefined;

    const query: Prisma.TeacherFindManyArgs = {
      where: {},
      include: {
        card: true,
        registers: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: limit,
      skip: offset,
    };

    const [teachers, total] = await this.prisma.$transaction([
      this.prisma.teacher.findMany(query),
      this.prisma.teacher.count({ where: query.where }),
    ]);

    return {
      data: teachers,
      total,
      perPage: limit || teachers.length,
    };
  }

  async findByCardUID(uid: string): Promise<Teacher> {
    const card = await this.prisma.card.findUnique({
      where: {
        uid,
      },
      include: {
        teacher: true,
      },
    });

    if (!card || !card.teacher) {
      throw new NotFoundException('Professor nao encontrado');
    }

    return card.teacher;
  }
}
