import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Teacher } from '@prisma/client';

import { JwtAuthGuard } from '@guards/jwt-auth.guard';

import { IPaginated } from '@models/paginated.model';

import { CurrentUser } from '@common/decorators/current-user.decorator';

import { CreateReserveValidator } from './validators/create-reserve.validator';
import { ListReservesValidator } from './validators/list-reserves.validator';

import { ReserveService } from './reserve.service';

import { Reserve } from './reserve';

@Controller('reserve')
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: CreateReserveValidator): Promise<Reserve> {
    return this.reserveService.create(data);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: number,
    @CurrentUser() user: Teacher,
  ): Promise<void> {
    await this.reserveService.delete({ id, requestor: user });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query() params: ListReservesValidator,
    @CurrentUser() user: Teacher,
  ): Promise<IPaginated<Reserve>> {
    return await this.reserveService.list({ ...params, requestor: user });
  }
}
