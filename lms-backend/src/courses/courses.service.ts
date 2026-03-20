import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateCourseDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  level?: string;
}

export class CreateModuleDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class CreateLessonDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['video', 'recording', 'resource', 'pdf'])
  type!: 'video' | 'recording' | 'resource' | 'pdf';

  @IsString()
  @IsOptional()
  videoId?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  resourceUrl?: string;

  @IsNumber()
  @IsOptional()
  durationSeconds?: number;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsString()
  @IsOptional()
  provider?: 'local' | 'cloudflare_stream' | 'r2';

  @IsString()
  @IsOptional()
  providerFileId?: string;

  @IsString()
  @IsOptional()
  status?: 'uploading' | 'processing' | 'ready' | 'failed';

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  learningOutcome?: string;
}

export class ReorderDto {
  items!: Array<{ id: string; orderIndex: number }>;
}

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ── Public Queries ──────────────────────────────────────────────────────────

  async findAll(search?: string, type?: 'free' | 'paid') {
    const where: any = { status: 'published' };
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (type === 'free') where.isFree = true;
    if (type === 'paid') where.isFree = false;

    return this.prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        isFree: true,
        thumbnailUrl: true,
        status: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                provider: true,
                providerFileId: true,
                status: true,
                videoId: true,
                videoUrl: true,
                resourceUrl: true,
                thumbnail: true,
                learningOutcome: true,
                durationSeconds: true,
                orderIndex: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  // ── Admin CRUD ────────────────────────────────────────────────────────────

  async findAllAdmin() {
    return this.prisma.course.findMany({
      include: {
        author: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(authorId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { ...dto, createdBy: authorId, isFree: dto.price === 0 || dto.isFree === true },
    });
  }

  async update(id: string, authorId: string, role: string, data: Partial<CreateCourseDto>) {
    await this.assertOwner(id, authorId, role);
    return this.prisma.course.update({ where: { id }, data });
  }

  async publish(id: string, authorId: string, role: string) {
    await this.assertOwner(id, authorId, role);
    await this.validateForPublish(id);
    return this.prisma.course.update({ where: { id }, data: { status: 'published' } });
  }

  async archive(id: string, authorId: string, role: string) {
    await this.assertOwner(id, authorId, role);
    return this.prisma.course.update({ where: { id }, data: { status: 'archived' } });
  }

  async delete(id: string, authorId: string, role: string) {
    await this.assertOwner(id, authorId, role);
    return this.prisma.course.delete({ where: { id } });
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  private async validateForPublish(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.modules.length === 0) {
      throw new BadRequestException('Course must have at least 1 module to publish');
    }
    for (const mod of course.modules) {
      if (mod.lessons.length === 0) {
        throw new BadRequestException(`Module "${mod.title}" has no content`);
      }
    }
  }

  // ── Modules ───────────────────────────────────────────────────────────────

  async createModule(courseId: string, authorId: string, role: string, dto: CreateModuleDto) {
    await this.assertOwner(courseId, authorId, role);
    // Gap-based ordering: find max and add 10
    const maxOrder = await this.prisma.module.aggregate({
      where: { courseId },
      _max: { orderIndex: true },
    });
    const orderIndex = dto.orderIndex ?? (maxOrder._max.orderIndex ?? 0) + 10;
    return this.prisma.module.create({ data: { courseId, ...dto, orderIndex } });
  }

  async updateModule(moduleId: string, data: Partial<CreateModuleDto>) {
    return this.prisma.module.update({ where: { id: moduleId }, data });
  }

  async deleteModule(moduleId: string) {
    return this.prisma.module.delete({ where: { id: moduleId } });
  }

  /** Drag-and-drop reorder: updates orderIndex for all changed modules */
  async reorderModules(courseId: string, items: Array<{ id: string; orderIndex: number }>) {
    const updates = items.map((item) =>
      this.prisma.module.update({
        where: { id: item.id, courseId },
        data: { orderIndex: item.orderIndex },
      }),
    );
    return this.prisma.$transaction(updates);
  }

  // ── Lessons ───────────────────────────────────────────────────────────────

  async createLesson(moduleId: string, authorId: string, role: string, dto: CreateLessonDto) {
    const module = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) throw new NotFoundException('Module not found');
    await this.assertOwner(module.courseId, authorId, role);
    // Gap-based ordering
    const maxOrder = await this.prisma.lesson.aggregate({
      where: { moduleId },
      _max: { orderIndex: true },
    });
    const orderIndex = dto.orderIndex ?? (maxOrder._max.orderIndex ?? 0) + 10;
    const status = dto.status || 'ready';
    return this.prisma.lesson.create({ data: { moduleId, ...dto, orderIndex, status } as any });
  }

  async updateLesson(lessonId: string, data: Partial<CreateLessonDto>) {
    return this.prisma.lesson.update({ where: { id: lessonId }, data: data as any });
  }

  async deleteLesson(lessonId: string) {
    return this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  /** Drag-and-drop reorder for lessons within a module */
  async reorderLessons(moduleId: string, items: Array<{ id: string; orderIndex: number }>) {
    const updates = items.map((item) =>
      this.prisma.lesson.update({
        where: { id: item.id, moduleId },
        data: { orderIndex: item.orderIndex },
      }),
    );
    return this.prisma.$transaction(updates);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async assertOwner(courseId: string, authorId: string, role?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    
    // Admins can edit any course
    if (role?.toLowerCase() === 'admin') return course;

    if (course.createdBy !== authorId) throw new ForbiddenException('Not your course');
    return course;
  }
}
