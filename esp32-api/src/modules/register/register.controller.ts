import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AdminGuard } from '@guards/admin.guard';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';

import { IPaginated } from '@models/paginated.model';

import { ListRegistersValidator } from './validators/list-registers.validator';

import { RegisterService } from './register.service';

import { Register } from './registers';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async list(
    @Query() params: ListRegistersValidator,
  ): Promise<IPaginated<Register>> {
    return await this.registerService.list(params);
  }
}
