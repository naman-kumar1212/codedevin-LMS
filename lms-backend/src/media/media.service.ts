import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { MediaProvider, UploadResult } from './media.interface';
import { MEDIA_PROVIDER } from './media.interface';


const PDF_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

@Injectable()
export class MediaService {
  constructor(
    @Inject(MEDIA_PROVIDER) private readonly provider: MediaProvider,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Upload a video file and update the lesson record.
   * Sets status = ready immediately (mock processing).
   * Future: swap LocalMediaProvider for CloudflareStreamProvider
   */
  async uploadVideo(
    lessonId: string,
    file: Express.Multer.File,
    meta?: { title?: string; description?: string },
  ): Promise<UploadResult> {
    const result = await this.provider.uploadVideo(file, meta);
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        providerFileId: result.providerFileId,
        provider: 'local',
        videoUrl: result.url,
        status: 'ready',
        ...(meta?.title ? { title: meta.title } : {}),
        ...(meta?.description ? { description: meta.description } : {}),
      },
    });
    return result;
  }

  /**
   * Upload a PDF file and update the lesson record.
   * Validates max 20 MB.
   */
  async uploadPDF(
    lessonId: string,
    file: Express.Multer.File,
    meta?: { title?: string; learningOutcome?: string },
  ): Promise<UploadResult> {
    if (file.size > PDF_MAX_BYTES) {
      throw new BadRequestException('PDF must be smaller than 20 MB');
    }
    const result = await this.provider.uploadPDF(file);
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        providerFileId: result.providerFileId,
        provider: 'local',
        resourceUrl: result.url,
        status: 'ready',
        ...(meta?.title ? { title: meta.title } : {}),
        ...(meta?.learningOutcome ? { learningOutcome: meta.learningOutcome } : {}),
      },
    });
    return result;
  }


  /**
   * Update lesson metadata without re-upload (for the content metadata modal).
   */
  async updateLessonMeta(
    lessonId: string,
    meta: {
      title?: string;
      description?: string;
      thumbnail?: string;
      learningOutcome?: string;
    },
  ) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return this.prisma.lesson.update({ where: { id: lessonId }, data: meta });
  }

  /**
   * Migration-safe URL resolver.
   * local  -> /public/uploads/...
   * cloudflare_stream -> HLS manifest URL
   * r2 -> R2 public bucket URL
   */
  getMediaUrl(provider: string, providerFileId: string): string {
    return this.provider.getUrl(provider, providerFileId);
  }

  async deleteMedia(lessonId: string): Promise<void> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson?.providerFileId) return;
    await this.provider.deleteMedia(lesson.providerFileId);
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { providerFileId: null, status: 'failed' },
    });
  }
}
