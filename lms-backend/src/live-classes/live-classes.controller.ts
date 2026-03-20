import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { LiveClassesService } from './live-classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IsString, IsInt, IsDateString, Min } from 'class-validator';

class CreateLiveClassDto {
  @IsString() courseId: string;
  @IsString() title: string;
  @IsDateString() scheduledAt: string;
  @IsInt() @Min(1) durationMinutes: number;
}

class AttachRecordingDto {
  @IsString() recordingUrl: string;
}

@Controller('live-classes')
@UseGuards(JwtAuthGuard)
export class LiveClassesController {
  constructor(private readonly liveClassesService: LiveClassesService) {}

  /** Admin: create live class */
  @Post()
  create(@Body() dto: CreateLiveClassDto) {
    return this.liveClassesService.create({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
    });
  }

  /** Student: my upcoming live classes */
  @Get()
  getStudentLiveClasses(@Req() req: Request) {
    return this.liveClassesService.getStudentLiveClasses((req.user as any).id);
  }

  /** Admin: all live classes */
  @Get('admin')
  getAllLiveClasses() {
    return this.liveClassesService.getAllLiveClasses();
  }

  /** Admin: attach recording URL */
  @Patch(':id/recording')
  attachRecording(@Param('id') id: string, @Body() dto: AttachRecordingDto) {
    return this.liveClassesService.attachRecording(id, dto.recordingUrl);
  }
}
