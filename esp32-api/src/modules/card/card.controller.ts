import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminGuard } from '@guards/admin.guard';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';

import { IPaginated } from '@models/paginated.model';

import { AssignCardValidator } from './validators/assign-card.validator';
import { ListCardsValidator } from './validators/list-cards.validator';

import { CardService } from './card.service';

import { Card } from './card';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async test(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.cardService.delete(id);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.cardService.delete(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async list(@Query() params: ListCardsValidator): Promise<IPaginated<Card>> {
    return await this.cardService.list(params);
  }

  @Patch('/:id/assign-teacher')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async assignTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AssignCardValidator,
  ): Promise<void> {
    await this.cardService.assignTeacher(id, data.teacher_id);
  }
}
