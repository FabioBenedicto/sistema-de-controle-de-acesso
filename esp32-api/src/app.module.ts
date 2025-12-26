import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ClassroomModule } from './modules/classroom/classroom.module';
import { RegisterModule } from './modules/register/register.module';
import { CardModule } from 'src/modules/card/card.module';
import { ReserveModule } from 'src/modules/reserve/reserve.module';
import { SessionModule } from 'src/modules/session/session.module';
import { TeacherModule } from 'src/modules/teacher/teacher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    SessionModule,
    TeacherModule,
    CardModule,
    ClassroomModule,
    ReserveModule,
    RegisterModule,
  ],
})
export class AppModule {}
