import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { CoursesService, CreateCourseDto, CreateModuleDto, CreateLessonDto, ReorderDto } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: 'free' | 'paid',
  ) {
    return this.coursesService.findAll(search, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  // ── Admin: Courses CRUD ───────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllAdmin() {
    return this.coursesService.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Req() req: Request, @Body() dto: CreateCourseDto) {
    return this.coursesService.create((req.user as any).id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Req() req: Request, @Param('id') id: string, @Body() data: Partial<CreateCourseDto>) {
    const user = req.user as any;
    return this.coursesService.update(id, user.id, user.role, data);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  publish(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.coursesService.publish(id, user.id, user.role);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  archive(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.coursesService.archive(id, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.coursesService.delete(id, user.id, user.role);
  }

  // ── Admin: Modules ────────────────────────────────────────────────────────

  @Post(':courseId/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createModule(
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.coursesService.createModule(courseId, user.id, user.role, dto);
  }

  @Patch(':courseId/modules/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  reorderModules(
    @Param('courseId') courseId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.coursesService.reorderModules(courseId, dto.items);
  }

  @Patch('modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateModule(@Param('moduleId') moduleId: string, @Body() data: Partial<CreateModuleDto>) {
    return this.coursesService.updateModule(moduleId, data);
  }

  @Delete('modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteModule(@Param('moduleId') moduleId: string) {
    return this.coursesService.deleteModule(moduleId);
  }

  // ── Admin: Lessons ────────────────────────────────────────────────────────

  @Post('modules/:moduleId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.coursesService.createLesson(moduleId, user.id, user.role, dto);
  }

  @Patch('modules/:moduleId/lessons/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  reorderLessons(
    @Param('moduleId') moduleId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.coursesService.reorderLessons(moduleId, dto.items);
  }

  @Patch('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateLesson(@Param('lessonId') lessonId: string, @Body() data: Partial<CreateLessonDto>) {
    return this.coursesService.updateLesson(lessonId, data);
  }

  @Delete('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteLesson(@Param('lessonId') lessonId: string) {
    return this.coursesService.deleteLesson(lessonId);
  }
}
