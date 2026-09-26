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
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import sharp from 'sharp';
import { dirname, parse } from 'path';

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
  constructor(
    private readonly mediaService: MediaService,
    private readonly prisma: PrismaService,
  ) { }

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
   * Upload a course thumbnail/preview image.
   * Updates Course.thumbnailUrl with the path to the stored image.
   */
  @Post('upload/thumbnail/:courseId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('thumbnails'),
      fileFilter(_req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  async uploadCourseThumbnail(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    
    const inputPath = file.path;
    const filename = `${parse(file.filename).name}.webp`;
    const outputPath = join(dirname(inputPath), filename);

    try {
      await sharp(inputPath)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      // Delete original file
      const { unlinkSync } = await import('fs');
      unlinkSync(inputPath);
    } catch (error) {
      console.error('Sharp error:', error);
      // If sharp fails, we might still have the original file if it didn't throw before toFile
    }

    const thumbnailUrl = `/public/uploads/thumbnails/${filename}`;
    await this.prisma.course.update({
      where: { id: courseId },
      data: { thumbnailUrl },
    });
    return { thumbnailUrl };
  }

  /**
   * Upload a lesson thumbnail/cover image.
   * Updates Lesson.thumbnailUrl with the path to the stored image.
   */
  @Post('upload/lesson-thumbnail/:lessonId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('lesson-thumbnails'),
      fileFilter(_req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  async uploadLessonThumbnail(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    
    const inputPath = file.path;
    const filename = `${parse(file.filename).name}.webp`;
    const outputPath = join(dirname(inputPath), filename);

    try {
      await sharp(inputPath)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      const { unlinkSync } = await import('fs');
      unlinkSync(inputPath);
    } catch (error) {
      console.error('Sharp error:', error);
    }

    const thumbnailUrl = `/public/uploads/lesson-thumbnails/${filename}`;
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { thumbnail: thumbnailUrl },
    });
    return { thumbnailUrl };
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
