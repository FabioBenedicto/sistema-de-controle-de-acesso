import { Module } from '@nestjs/common';

import { DatabaseModule } from '@database/prisma.module';

import { MqttModule } from '@common/mqtt/mqtt.module';

import { ClassroomModule } from '../classroom/classroom.module';
import { TeacherModule } from '../teacher/teacher.module';

import { RegisterController } from './register.controller';
import { RegisterMqttController } from './register.mqtt.controller';

import { RegisterService } from './register.service';

@Module({
  imports: [DatabaseModule, MqttModule, ClassroomModule, TeacherModule],
  controllers: [RegisterController, RegisterMqttController],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
