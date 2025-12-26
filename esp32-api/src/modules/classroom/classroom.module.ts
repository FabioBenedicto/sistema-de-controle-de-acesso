import { Module } from '@nestjs/common';

import { DatabaseModule } from '@database/prisma.module';

import { MqttModule } from '@common/mqtt/mqtt.module';

import { ClassroomController } from './classroom.controller';

import { ClassroomService } from './classroom.service';

@Module({
  imports: [DatabaseModule, MqttModule],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
