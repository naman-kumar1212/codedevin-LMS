import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalStudents, totalEnrollments, revenueResult, totalCertificates] = await Promise.all([
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.enrollment.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      this.prisma.certificate.count(),
    ]);

    const [enrollmentStats, recentEnrollments] = await Promise.all([
      this.prisma.enrollment.findMany({
        include: { course: { select: { category: true } } },
      }),
      this.prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
      }),
    ]);

    const categoryCounts: Record<string, number> = {};
    enrollmentStats.forEach((enr) => {
      const cat = enr.course.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const courseDistribution = Object.entries(categoryCounts).map(([label, count]) => ({
      label,
      percent: Math.round((count / (totalEnrollments || 1)) * 100),
    })).sort((a, b) => b.percent - a.percent);

    const popularCourses = await this.prisma.course.findMany({
      take: 5,
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
    });

    return {
      totalStudents,
      totalEnrollments,
      totalRevenue: revenueResult._sum.amount ?? 0,
      totalCertificates,
      recentEnrollments,
      popularCourses,
      courseDistribution: courseDistribution.length > 0 ? courseDistribution : [
        { label: 'DSA & Algorithms', percent: 45 },
        { label: 'Java Programming', percent: 30 },
        { label: 'C++ Development', percent: 25 },
      ],
    };
  }

  async getStudents(search?: string) {
    const students = await this.prisma.user.findMany({
      where: {
        role: 'student',
        ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { enrollments: true, certificates: true } },
        payments: {
          where: { status: 'SUCCESS' },
          select: { id: true, amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return students;
  }

  async getStudent(studentId: string) {
    return this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: { include: { course: { select: { id: true, title: true } } } },
        certificates: { include: { course: { select: { id: true, title: true } } } },
      },
    });
  }

  async getCertificates() {
    return this.prisma.certificate.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
