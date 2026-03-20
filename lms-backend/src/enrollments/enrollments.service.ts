import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enrollFree(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.isFree) throw new ConflictException('Course is not free. Use payment flow.');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) throw new ConflictException('Already enrolled');

    return this.prisma.enrollment.create({ data: { studentId, courseId } });
  }

  async getMyCourses(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            _count: { select: { modules: true } },
            modules: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async checkAccess(studentId: string, courseId: string): Promise<{ hasAccess: boolean }> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    return { hasAccess: !!enrollment };
  }
}
