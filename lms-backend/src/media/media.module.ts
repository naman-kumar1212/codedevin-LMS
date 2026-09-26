import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { MediaController } from './media.controller';
import { MediaStreamController } from './media-stream.controller';
import { MediaService } from './media.service';
import { LocalMediaProvider } from './local-media.provider';
import { MEDIA_PROVIDER } from './media.interface';

@Module({
  imports: [
    MulterModule.register({}),
    PrismaModule,
  ],
  controllers: [MediaController, MediaStreamController],
  providers: [
    MediaService,
    PrismaService,
    {
      provide: MEDIA_PROVIDER,
      useClass: LocalMediaProvider,
      // To migrate to Cloudflare: swap LocalMediaProvider with CloudflareStreamProvider
    },
    LocalMediaProvider,
  ],
  exports: [MediaService],
})
export class MediaModule {}
