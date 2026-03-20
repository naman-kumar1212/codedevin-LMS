import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';

@Processor('certificates')
@Injectable()
export class CertificatesProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificatesProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { certificateId } = job.data;
    this.logger.log(`Processing certificate generation for ID: ${certificateId}`);

    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: true,
        course: true,
      },
    });

    if (!cert) {
      this.logger.error(`Certificate ${certificateId} not found`);
      return;
    }

    try {
      const pdfBuffer = await this.generatePdf(cert);
      
      // Update database with the PDF buffer and a dynamic URL
      const viewUrl = `/api/certificates/view/${certificateId}`;
      
      await this.prisma.certificate.update({
        where: { id: certificateId },
        data: { 
          pdfUrl: viewUrl,
          pdfData: pdfBuffer as any
        } as any,
      });

      this.logger.log(`Successfully generated certificate for ${cert.student.name}`);
    } catch (error) {
      this.logger.error(`Failed to generate PDF for certificate ${certificateId}: ${error.message}`);
      throw error;
    }
  }

  private async generatePdf(cert: any): Promise<Buffer> {
    const searchPaths = [
      path.join(__dirname, 'templates', 'certificate.html'),
      path.join(process.cwd(), 'src', 'certificates', 'templates', 'certificate.html'),
      path.join(process.cwd(), 'dist', 'src', 'certificates', 'templates', 'certificate.html'),
      path.join(process.cwd(), 'dist', 'certificates', 'templates', 'certificate.html'),
    ];

    let templatePath = '';
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        templatePath = p;
        break;
      }
    }

    if (!templatePath) {
      throw new Error(`Certificate template not found in any of: ${searchPaths.join(', ')}`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Simple replacement
    html = html
      .replace('{{STUDENT_NAME}}', cert.student.name)
      .replace('{{COURSE_NAME}}', cert.course.title)
      .replace('{{DATE}}', new Date(cert.issuedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }))
      .replace('{{CERTIFICATE_CODE}}', cert.certificateCode);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      width: '1060px',
      height: '750px',
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
  }
}
