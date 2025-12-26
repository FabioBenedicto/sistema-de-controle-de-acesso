import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Teacher } from 'src/modules/teacher/teacher';

import { CurrentUser } from '@decorators/current-user.decorator';

import { LocalAuthGuard } from '@guards/local-auth.guard';

import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

import { ClassroomService } from '../classroom/classroom.service';
import { MqttService } from '@common/mqtt/mqtt.service';

@Controller('session')
export class SessionController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mqttService: MqttService,
    private readonly classroomService: ClassroomService,
  ) {}

  @Post()
  @UseGuards(LocalAuthGuard)
  create(@CurrentUser() teacher: Teacher): Teacher {
    const payload = { sub: teacher.id };
    const token = this.jwtService.sign(payload);

    this.mqttService.publish('classroom/1/register-entry/request', {
      card_uid: '312313131',
      classroom_id: '1',
      entry_datetime: new Date(),
    });

    return {
      ...teacher,
      token,
    };
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  teacher(@CurrentUser() teacher: Teacher): Teacher {
    return teacher;
  }
}
