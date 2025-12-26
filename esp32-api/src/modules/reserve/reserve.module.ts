import { Module } from '@nestjs/common';

import { DatabaseModule } from '@database/prisma.module';

import { ReserveController } from './reserve.controller';

import { ReserveService } from './reserve.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReserveController],
  providers: [ReserveService],
  exports: [ReserveService],
})
export class ReserveModule {}
