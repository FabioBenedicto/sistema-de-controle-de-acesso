import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { MQTT_CLIENT } from './mqtt.constants';

@Injectable()
export class MqttService {
  private readonly logger = new Logger(MqttService.name);

  constructor(
    @Inject(MQTT_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  publish<T>(topic: string, payload: T) {
    this.logger.log('Mensagem publicada no tópico:', topic);
    this.logger.log('Conteúdo:', payload);
    return this.client.emit(topic, payload);
  }
}
