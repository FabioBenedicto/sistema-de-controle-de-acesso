import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-local';
import { Teacher } from 'src/modules/teacher/teacher';

import { TeacherService } from 'src/modules/teacher/teacher.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private teacherService: TeacherService) {
    super({
      usernameField: 'protocol',
    });
  }

  async validate(protocol: string, password: string): Promise<Teacher> {
    const teacher = await this.teacherService.findProtocol(protocol);

    if (!teacher || teacher.password !== password) {
      throw new UnauthorizedException('Protocolo ou senha inválido');
    }

    return teacher;
  }
}
