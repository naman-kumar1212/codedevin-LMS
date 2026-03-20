import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private certificatesService: CertificatesService,
  ) {}

  async trackVideo(studentId: string, lessonId: string, watchedPercentage: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Verify enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: lesson.module.courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');

    const isCompleted = watchedPercentage >= 80;

    await this.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId, lessonId } },
      create: {
        studentId,
        lessonId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    let courseCompleted = false;
    if (isCompleted) {
      courseCompleted = await this.checkAndIssueCertificate(studentId, lesson.module.courseId);
    }

    return { lessonId, isCompleted, courseCompleted };
  }

  async markResourceComplete(studentId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: lesson.module.courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');

    await this.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId, lessonId } },
      create: { studentId, lessonId, isCompleted: true, completedAt: new Date() },
      update: { isCompleted: true, completedAt: new Date() },
    });

    const courseCompleted = await this.checkAndIssueCertificate(studentId, lesson.module.courseId);
    return { lessonId, isCompleted: true, courseCompleted };
  }

  async getCourseProgress(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, title: true, type: true, durationSeconds: true },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    const progressRecords = await this.prisma.lessonProgress.findMany({
      where: { studentId, lessonId: { in: allLessonIds } },
    });
    const completedSet = new Set(
      progressRecords.filter((p) => p.isCompleted).map((p) => p.lessonId),
    );

    const completedLessons = completedSet.size;
    const totalLessons = allLessonIds.length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const modules = course.modules.map((m) => ({
      moduleId: m.id,
      title: m.title,
      totalLessons: m.lessons.length,
      completedLessons: m.lessons.filter((l) => completedSet.has(l.id)).length,
      lessons: m.lessons.map((l) => ({
        lessonId: l.id,
        title: l.title,
        type: l.type,
        durationSeconds: l.durationSeconds,
        isCompleted: completedSet.has(l.id),
      })),
    }));

    return { courseId, totalLessons, completedLessons, percentage, modules };
  }

  /** Check if all lessons completed → issue certificate */
  private async checkAndIssueCertificate(studentId: string, courseId: string): Promise<boolean> {
    const totalLessons = await this.prisma.lesson.count({
      where: { module: { courseId } },
    });
    const completedLessons = await this.prisma.lessonProgress.count({
      where: { studentId, isCompleted: true, lesson: { module: { courseId } } },
    });

    if (completedLessons < totalLessons) return false;

    // All lessons done — issue certificate (idempotent)
    await this.certificatesService.issue(studentId, courseId);
    return true;
  }

  /**
   * Admin-only: return full curriculum structure for preview purposes.
   * No enrollment check — the caller must be ADMIN (enforced at controller level).
   * All lessons are marked isCompleted: false since there's no student context.
   */
  async getAdminCoursePreview(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, title: true, type: true, durationSeconds: true },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const totalLessons = course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0,
    );

    const modules = course.modules.map((m) => ({
      moduleId: m.id,
      title: m.title,
      totalLessons: m.lessons.length,
      completedLessons: 0,
      lessons: m.lessons.map((l) => ({
        lessonId: l.id,
        title: l.title,
        type: l.type,
        durationSeconds: l.durationSeconds,
        isCompleted: false,
      })),
    }));

    return {
      courseId,
      totalLessons,
      completedLessons: 0,
      percentage: 0,
      modules,
      isAdminPreview: true,
    };
  }
}
