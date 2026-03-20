import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { randomUUID } from 'crypto';

@Injectable()
export class LiveClassesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Admin creates a live class.
   * MOCK: Zoom API is not called — we generate fake meeting ID and join URL.
   */
  async create(dto: {
    courseId: string;
    title: string;
    scheduledAt: Date;
    durationMinutes: number;
  }) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    // MOCK Zoom integration
    const mockMeetingId = `MOCK-${randomUUID().substring(0, 8).toUpperCase()}`;
    const mockJoinUrl = `https://zoom.us/j/${Math.floor(Math.random() * 9000000000) + 1000000000}?pwd=mockpassword`;

    const liveClass = await this.prisma.liveClass.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        zoomMeetingId: mockMeetingId,
        zoomJoinUrl: mockJoinUrl,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes,
      },
      include: {
        course: { select: { title: true } },
      },
    });

    // Notify all enrolled students
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: dto.courseId },
      select: { studentId: true },
    });

    await Promise.all(
      enrollments.map((e) =>
        this.notificationsService.createNotification(
          e.studentId,
          'live_class',
          'New Live Class Scheduled',
          `"${dto.title}" is scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`,
        ),
      ),
    );

    return liveClass;
  }

  /** Student: get upcoming live classes for enrolled courses */
  async getStudentLiveClasses(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);

    return this.prisma.liveClass.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  /** Admin: get all live classes */
  async getAllLiveClasses() {
    return this.prisma.liveClass.findMany({
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /** Admin: attach a recording URL to a live class */
  async attachRecording(classId: string, recordingUrl: string) {
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: classId },
    });
    if (!liveClass) throw new NotFoundException('Live class not found');

    return this.prisma.liveClass.update({
      where: { id: classId },
      data: { recordingUrl },
    });
  }
}
