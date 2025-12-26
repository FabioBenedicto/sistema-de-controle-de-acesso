import {
  Controller,
  HttpException,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';

import { IMqttResponse } from '@common/models/mqtt-response.model';

import { HandleRegisterEntryValidator } from './validators/mqtt/handle-register-entry.validator';
import { HandleRegisterExitValidator } from './validators/mqtt/handle-register-exit.validator';

import { ClassroomService } from '../classroom/classroom.service';
import { TeacherService } from '../teacher/teacher.service';
import { RegisterService } from './register.service';
import { MqttService } from '@common/mqtt/mqtt.service';

@Controller()
export class RegisterMqttController {
  private readonly logger = new Logger(RegisterMqttController.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly classroomService: ClassroomService,
    private readonly teacherService: TeacherService,
    private readonly registerService: RegisterService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @MessagePattern('classroom/+/register-entry/request')
  async handleEntry(
    @Payload() data: HandleRegisterEntryValidator,
    @Ctx() context: MqttContext,
  ) {
    const request_topic = context.getTopic();

    this.logger.log('Mensagem recebida no tópico:', request_topic);
    this.logger.log('Conteúdo:', data);

    const classroom_id = Number(request_topic.split('/')[1]);
    const response_topic = `classroom/${classroom_id}/register-entry/response`;

    try {
      const classroom = await this.classroomService.findById(data.classroom_id);
      const teacher = await this.teacherService.findByCardUID(data.card_uid);

      const register = await this.registerService.registerEntry({
        entry_datetime: data.entry_datetime,
        classroom_id: classroom.id,
        teacher_id: teacher.id,
      });

      this.mqttService.publish(response_topic, {
        status: 'ok',
        message: 'Sala ocupada',
        data: {
          classroom_name: register.classroom.name,
          teacher_name: register.teacher.name,
        },
      });
    } catch (error) {
      let message = 'Erro inesperado';

      if (error instanceof HttpException) {
        const response = error.getResponse();

        if (typeof response === 'object' && response['message']) {
          message = response['message'];
        }
      }

      this.mqttService.publish(response_topic, {
        status: 'error',
        message,
      });
    }
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @MessagePattern('classroom/+/register-exit/request')
  async handleExit(
    @Payload() data: HandleRegisterExitValidator,
    @Ctx() context: MqttContext,
  ) {
    const request_topic = context.getTopic();

    this.logger.log('Mensagem recebida no tópico:', request_topic);
    this.logger.log('Conteúdo:', data);

    const classroom_id = Number(request_topic.split('/')[1]);
    const response_topic = `classroom/${classroom_id}/register-exit/response`;

    try {
      const classroom = await this.classroomService.findById(data.classroom_id);
      const teacher = await this.teacherService.findByCardUID(data.card_uid);

      await this.registerService.registerExit({
        exit_datetime: data.exit_datetime,
        classroom_id: classroom.id,
        teacher_id: teacher.id,
      });

      this.mqttService.publish<IMqttResponse>(response_topic, {
        status: 'ok',
        message: 'Sala livre',
      });
    } catch (error) {
      let message = 'Erro inesperado';

      if (error instanceof HttpException) {
        const response = error.getResponse();

        if (typeof response === 'object' && response['message']) {
          message = response['message'];
        }
      }

      this.mqttService.publish(response_topic, {
        status: 'error',
        message,
      });
    }
  }
}
