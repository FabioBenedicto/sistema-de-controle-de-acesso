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

import { HandleCreateCardValidator } from './validators/mqtt/handle-create-card.validator';

import { MqttService } from '@common/mqtt/mqtt.service';
import { CardService } from 'src/modules/card/card.service';

@Controller()
export class CardMqttController {
  private readonly logger = new Logger(CardMqttController.name);

  constructor(
    private readonly cardService: CardService,
    private readonly mqttService: MqttService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @MessagePattern('classroom/+/create-card/request')
  async handleCreateCard(
    @Payload() data: HandleCreateCardValidator,
    @Ctx() context: MqttContext,
  ) {
    const request_topic = context.getTopic();

    this.logger.log('Mensagem recebida no tópico:', request_topic);
    this.logger.log('Conteúdo:', data);

    const classroom_id = Number(request_topic.split('/')[1]);
    const response_topic = `classroom/${classroom_id}/create-card/response`;

    try {
      await this.cardService.create(data);

      
      this.mqttService.publish(response_topic, {
        status: 'ok',
        message: 'Cartão criado com sucesso',
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