import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('video')
  trackVideo(
    @Req() req: Request,
    @Body() body: { lessonId: string; watchedPercentage: number },
  ) {
    const p = Math.max(0, Math.min(100, body.watchedPercentage || 0));
    return this.progressService.trackVideo(
      (req.user as any).id,
      body.lessonId,
      p,
    );
  }

  @Post('resource')
  markResource(@Req() req: Request, @Body() body: { lessonId: string }) {
    return this.progressService.markResourceComplete((req.user as any).id, body.lessonId);
  }

  @Get('courses/:courseId')
  getCourseProgress(@Req() req: Request, @Param('courseId') courseId: string) {
    return this.progressService.getCourseProgress((req.user as any).id, courseId);
  }

  /**
   * Admin-only preview — bypasses enrollment check.
   * Guarded by JWT + RolesGuard; non-admins receive 403 Forbidden.
   */
  @Get('courses/:courseId/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAdminCoursePreview(@Param('courseId') courseId: string) {
    return this.progressService.getAdminCoursePreview(courseId);
  }
}
