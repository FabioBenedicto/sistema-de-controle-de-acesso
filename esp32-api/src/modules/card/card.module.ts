import { Module } from '@nestjs/common';

import { DatabaseModule } from '@database/prisma.module';

import { MqttModule } from '@common/mqtt/mqtt.module';

import { CardController } from './card.controller';
import { CardMqttController } from './card.mqtt.controller';

import { CardService } from './card.service';

@Module({
  imports: [DatabaseModule, MqttModule],
  controllers: [CardController, CardMqttController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
