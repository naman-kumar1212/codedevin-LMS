// Triggered restart for single-page PDF fix
import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CertificateQueueService } from './certificate-queue.service';

@Injectable()
export class CertificatesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private queueService: CertificateQueueService,
  ) {}

  async onModuleInit() {
    // Process legacy certificates that don't have a PDF yet
    const pendingCerts = await this.prisma.certificate.findMany({
      where: { 
        OR: [
          { pdfUrl: null },
          { pdfData: null }
        ]
      } as any,
      select: { id: true },
    });

    for (const cert of pendingCerts) {
      await this.queueService.addCertificateJob(cert.id);
    }
    
    if (pendingCerts.length > 0) {
      console.log(`Queued ${pendingCerts.length} legacy certificates for generation.`);
    }
  }

  /**
   * Synchronously issue a certificate — no Puppeteer for prototype.
   * pdfUrl is set to null and can be updated when PDF generation is added.
   */
  async issue(studentId: string, courseId: string) {
    const existing = await this.prisma.certificate.findFirst({
      where: { studentId, courseId },
    });
    if (existing) return existing;

    const year = new Date().getFullYear();
    const certificateCode = `CDS-${courseId.substring(0, 8)}-${studentId.substring(0, 8)}-${year}`;

    const cert = await this.prisma.certificate.create({
      data: {
        studentId,
        courseId,
        certificateCode,
        pdfUrl: null,
      },
    });

    // Send in-app notification
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (course) {
      await this.notificationsService.createNotification(
        studentId,
        'certificate',
        'Certificate Issued!',
        `Congratulations! Your certificate for "${course.title}" has been issued.`,
      );
    }

    // Push to generation queue
    await this.queueService.addCertificateJob(cert.id);

    return cert;
  }

  async getMyCertificates(studentId: string) {
    const certs = await this.prisma.certificate.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, title: true, thumbnailUrl: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return certs.map((cert: any) => ({
      ...cert,
      pdfUrl: cert.pdfData ? `/api/certificates/view/${cert.id}` : null,
    }));
  }

  async verify(certificateCode: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateCode },
      include: {
        student: { select: { name: true } },
        course: { select: { title: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return {
      isValid: true,
      studentName: cert.student.name,
      courseName: cert.course.title,
      issuedAt: cert.issuedAt,
      certificateCode: cert.certificateCode,
    };
  }

  async getAdminCertificates() {
    const certs = await this.prisma.certificate.findMany({
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return certs.map((cert: any) => ({
      ...cert,
      pdfUrl: cert.pdfData ? `/api/certificates/view/${cert.id}` : null,
    }));
  }

  async getCertificateData(id: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      select: { pdfData: true, studentId: true } as any,
    });
    if (!cert || !(cert as any).pdfData) throw new NotFoundException('Certificate PDF not found');
    return cert as any;
  }
}
