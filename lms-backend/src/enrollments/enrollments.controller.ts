import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('courses/:id/enroll')
  enroll(@Req() req: Request, @Param('id') courseId: string) {
    return this.enrollmentsService.enrollFree((req.user as any).id, courseId);
  }

  @Get('students/me/courses')
  getMyCourses(@Req() req: Request) {
    return this.enrollmentsService.getMyCourses((req.user as any).id);
  }

  @Get('courses/:id/access')
  checkAccess(@Req() req: Request, @Param('id') courseId: string) {
    return this.enrollmentsService.checkAccess((req.user as any).id, courseId);
  }
}
