import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { CertificateQueueService } from './certificate-queue.service';
import { CertificatesProcessor } from './certificates.processor';

@Module({
  imports: [
    NotificationsModule,
    BullModule.registerQueue({
      name: 'certificates',
    }),
  ],
  controllers: [CertificatesController],
  providers: [
    CertificatesService,
    CertificateQueueService,
    CertificatesProcessor,
  ],
  exports: [CertificatesService],
})
export class CertificatesModule {}
