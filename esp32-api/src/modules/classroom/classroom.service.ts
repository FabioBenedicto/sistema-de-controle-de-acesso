import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { IPaginated } from '@common/models/paginated.model';

import { CreateClassroomDTO } from './dtos/create-classroom.dto';
import { IListClassroomsDTO } from './dtos/list-classrooms.dto';

import { PrismaService } from '@common/database/prisma.service';
import { MqttService } from '@common/mqtt/mqtt.service';

import { Classroom } from './classroom';

@Injectable()
export class ClassroomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mqttService: MqttService,
  ) {}

  async create(data: CreateClassroomDTO): Promise<Classroom> {
    const exiting_classroom = await this.prisma.classroom.findFirst({
      where: {
        name: {
          mode: 'insensitive',
          equals: data.name,
        },
      },
    });

    if (exiting_classroom) {
      throw new ConflictException('Sala já criada');
    }

    return await this.prisma.classroom.create({
      data: {
        name: data.name,
      },
    });
  }

  async delete(id: number): Promise<void> {
    const classroom = await this.prisma.classroom.findUnique({
      where: {
        id,
      },
    });

    if (!classroom) {
      throw new NotFoundException('Sala não encontrada');
    }

    const entry_register = await this.prisma.register.findFirst({
      where: {
        exit_datetime: null,
      },
    });

    if (entry_register) {
      throw new BadRequestException('Sala ocupada');
    }

    await this.prisma.classroom.delete({
      where: {
        id,
      },
    });
  }

  async findByName(name: string): Promise<Classroom> {
    const classroom = await this.prisma.classroom.findFirst({
      where: {
        name: {
          mode: 'insensitive',
          equals: name,
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Sala não encontrada');
    }

    return classroom;
  }

  async findById(id: number): Promise<Classroom> {
    const classroom = await this.prisma.classroom.findFirst({
      where: {
        id,
      },
    });

    if (!classroom) {
      throw new NotFoundException('Sala não encontrada');
    }

    return classroom;
  }

  async list({
    limit,
    page = 1,
  }: IListClassroomsDTO): Promise<IPaginated<Classroom>> {
    const offset = limit ? (page - 1) * limit : undefined;

    const query: Prisma.ClassroomFindManyArgs = {
      where: {},
      orderBy: {
        id: 'desc',
      },
      take: limit,
      skip: offset,
    };

    const [classrooms, total] = await this.prisma.$transaction([
      this.prisma.classroom.findMany(query),
      this.prisma.classroom.count({ where: query.where }),
    ]);

    return {
      data: classrooms,
      total,
      perPage: limit || classrooms.length,
    };
  }

  activateCreationMode(classroom_id: number) {
    const topic = `classroom/${classroom_id}/activate-creation-mode`;
    this.mqttService.publish(topic, {});
  }

  forceFree(classroom_id: number) {
    const topic = `classroom/${classroom_id}/force-free`;
    this.mqttService.publish(topic, {});
  }
}
