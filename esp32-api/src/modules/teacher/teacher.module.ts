import { Module } from '@nestjs/common';

import { DatabaseModule } from '@database/prisma.module';

import { TeacherController } from './teacher.controller';

import { TeacherService } from './teacher.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
