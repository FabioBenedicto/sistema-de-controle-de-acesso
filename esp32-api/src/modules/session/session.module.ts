import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { MqttModule } from '@common/mqtt/mqtt.module';

import { ClassroomModule } from '../classroom/classroom.module';
import { TeacherModule } from 'src/modules/teacher/teacher.module';

import { SessionController } from './session.controller';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    TeacherModule,
    PassportModule,
    MqttModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '6h' },
      }),
      inject: [ConfigService],
    }),
    ClassroomModule,
  ],
  controllers: [SessionController],
  providers: [LocalStrategy, JwtStrategy],
})
export class SessionModule {}
