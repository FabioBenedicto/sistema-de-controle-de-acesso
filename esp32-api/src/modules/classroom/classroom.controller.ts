import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminGuard } from '@guards/admin.guard';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';

import { IPaginated } from '@models/paginated.model';

import { CreateClassroomValidator } from './validators/create-classroom.validator';
import { ListClassroomsValidator } from './validators/list-classrooms.validator';

import { ClassroomService } from './classroom.service';

import { Classroom } from './classroom';

@Controller('classroom')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() data: CreateClassroomValidator) {
    await this.classroomService.create(data);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.classroomService.delete(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query() params: ListClassroomsValidator,
  ): Promise<IPaginated<Classroom>> {
    return await this.classroomService.list(params);
  }

  @Post(':id/activate-creation-mode')
  @UseGuards(JwtAuthGuard, AdminGuard)
  activateCreationMode(@Param('id', ParseIntPipe) id: number) {
    this.classroomService.activateCreationMode(id);
  }

  @Post(':id/force-free')
  @UseGuards(JwtAuthGuard, AdminGuard)
  forceFree(@Param('id', ParseIntPipe) id: number) {
    this.classroomService.forceFree(id);
  }
}
