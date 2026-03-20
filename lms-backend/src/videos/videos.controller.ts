import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IsString } from 'class-validator';

class GetUploadUrlDto {
  @IsString() filename: string;
}

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  /** Admin: Get upload URL for a video (mock) */
  @Post('upload-url')
  getUploadUrl(@Body() dto: GetUploadUrlDto) {
    return this.videosService.getUploadUrl(dto.filename);
  }

  /** Admin: Check video processing status (mock — always ready) */
  @Get(':videoId/status')
  getStatus(@Param('videoId') videoId: string) {
    return this.videosService.getStatus(videoId);
  }

  /** Mock upload receiver (dev only — returns 200 immediately) */
  @Post('mock-upload/:videoId')
  mockUpload(@Param('videoId') videoId: string) {
    return { success: true, videoId, message: 'Mock upload received' };
  }
}
