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

import { AdminGuard } from '@guards/admin.guard';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';

import { IPaginated } from '@models/paginated.model';

import { CreateTeacherValidator } from './validators/create-teacher.validator';
import { ListTeachersValidator } from './validators/list-teachers.validator';

import { TeacherService } from './teacher.service';

import { Teacher } from './teacher';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() data: CreateTeacherValidator): Promise<Teacher> {
    return this.teacherService.create(data);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id') id: number): Promise<void> {
    await this.teacherService.delete(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async list(
    @Query() params: ListTeachersValidator,
  ): Promise<IPaginated<Teacher>> {
    return await this.teacherService.list(params);
  }
}
