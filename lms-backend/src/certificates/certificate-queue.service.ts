import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CertificateQueueService {
  constructor(@InjectQueue('certificates') private certificateQueue: Queue) {}

  async addCertificateJob(certificateId: string) {
    await this.certificateQueue.add('generate', {
      certificateId,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    });
  }
}
