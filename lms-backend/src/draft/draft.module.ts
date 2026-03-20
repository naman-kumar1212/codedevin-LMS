import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';

import { REDIS_CLIENT } from './draft.constants';

@Module({
  imports: [ConfigModule],
  controllers: [DraftController],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        }),
    },
    DraftService,
  ],
  exports: [DraftService],
})
export class DraftModule {}
