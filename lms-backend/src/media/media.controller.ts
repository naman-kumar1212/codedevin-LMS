import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import type { Request } from 'express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

function createStorage(subdir: string) {
  return diskStorage({
    destination(_req, _file, cb) {
      const dir = join(process.cwd(), 'public', 'uploads', subdir);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const ext = extname(file.originalname);
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload a video file for a specific lesson.
   * File stored locally; providerFileId = filename. Status = ready.
   * Future: swap LocalMediaProvider with CloudflareStreamProvider → no change here.
   */
  @Post('upload/video/:lessonId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('videos'),
      fileFilter(_req, file, cb) {
        if (!file.mimetype.startsWith('video/')) {
          return cb(new BadRequestException('Only video files allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB max
    }),
  )
  async uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    meta: { title?: string; description?: string },
  ) {
    if (!file) throw new BadRequestException('Video file is required');
    return this.mediaService.uploadVideo(lessonId, file, meta);
  }

  /**
   * Upload a PDF file for a specific lesson.
   * Validated to be < 20 MB by MediaService.
   */
  @Post('upload/pdf/:lessonId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('pdfs'),
      fileFilter(_req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Only PDF files allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB hard limit
    }),
  )
  async uploadPDF(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() meta: { title?: string; learningOutcome?: string },
  ) {
    if (!file) throw new BadRequestException('PDF file is required');
    return this.mediaService.uploadPDF(lessonId, file, meta);
  }

  /**
   * Update content metadata (title, description, thumbnail, learningOutcome)
   * after upload — used by the content metadata modal.
   */
  @Patch('meta/:lessonId')
  updateMeta(
    @Param('lessonId') lessonId: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      thumbnail?: string;
      learningOutcome?: string;
    },
  ) {
    return this.mediaService.updateLessonMeta(lessonId, body);
  }

  /**
   * Get a media URL for a given provider + providerFileId.
   */
  @Get('url/:provider/:providerFileId')
  getUrl(
    @Param('provider') provider: string,
    @Param('providerFileId') providerFileId: string,
  ) {
    return { url: this.mediaService.getMediaUrl(provider, providerFileId) };
  }

  /**
   * Delete media associated with a lesson.
   */
  @Delete(':lessonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMedia(@Param('lessonId') lessonId: string) {
    return this.mediaService.deleteMedia(lessonId);
  }
}
