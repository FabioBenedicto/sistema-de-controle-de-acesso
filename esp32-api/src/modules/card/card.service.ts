import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { IPaginated } from '@common/models/paginated.model';

import { CreateCardDTO } from './dtos/create-card.dto';
import { IListCardsDTO } from './dtos/list-cards.dto';

import { PrismaService } from '@common/database/prisma.service';

import { Card } from './card';

@Injectable()
export class CardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCardDTO): Promise<Card> {
    const exiting_card = await this.prisma.card.findUnique({
      where: {
        uid: data.uid,
      },
    });

    if (exiting_card) {
      throw new ConflictException('Cartão já cadastrado');
    }

    return await this.prisma.card.create({
      data,
    });
  }

  async delete(id: number): Promise<void> {
    const card = await this.prisma.card.findUnique({
      where: {
        id,
      },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const entry_register = await this.prisma.register.findFirst({
      where: {
        exit_datetime: null,
        teacher: {
          card: {
            id: card.id,
          },
        },
      },
    });

    if (entry_register) {
      throw new BadRequestException(
        'Sala ocupada por professor associado ao cartão',
      );
    }

    await this.prisma.card.delete({
      where: {
        id,
      },
    });
  }

  async list({ limit, page = 1 }: IListCardsDTO): Promise<IPaginated<Card>> {
    const offset = limit ? (page - 1) * limit : undefined;

    const query: Prisma.CardFindManyArgs = {
      where: {},
      orderBy: {
        created_at: 'desc',
      },
      include: {
        teacher: true,
      },
      take: limit,
      skip: offset,
    };

    const [cards, total] = await this.prisma.$transaction([
      this.prisma.card.findMany(query),
      this.prisma.card.count({ where: query.where }),
    ]);

    return {
      data: cards,
      total,
      perPage: limit || cards.length,
    };
  }

  async assignTeacher(id: number, teacher_id: number): Promise<void> {
    const card = await this.prisma.card.findUnique({
      where: {
        id,
      },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id: teacher_id,
      },
      include: {
        card: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Professor não encontrado');
    }

    if (teacher.card) {
      throw new ConflictException('O professor já possui um cartão atribuído');
    }

    await this.prisma.card.update({
      where: {
        id,
      },
      data: {
        teacher_id,
      },
    });
  }
}
