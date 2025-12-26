import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

import { MqttService } from './mqtt.service';

import { MQTT_CLIENT } from './mqtt.constants';

import mqttConfigFactory from '../config/mqtt.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MQTT_CLIENT,
        useFactory: mqttConfigFactory,
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
