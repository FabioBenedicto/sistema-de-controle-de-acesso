import { ConfigService } from '@nestjs/config';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export default (configService: ConfigService) =>
  ({
    name: 'MQTT_CLIENT',
    transport: Transport.MQTT,
    options: {
      url: configService.get<string>('MQTT_URL'),
      // username: process.env.MQTT_USER || 'guest',
      // password: process.env.MQTT_PASS || 'guest',
      // clientId: 'nest-client-' + Math.random().toString(16).slice(2),
    },
  }) as ClientProviderOptions;
