import { Controller, Get, Param, Req, Res, UseGuards, NotFoundException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  /** Student: list my certificates */
  @Get('students/me/certificates')
  @UseGuards(JwtAuthGuard)
  getMyCertificates(@Req() req: Request) {
    return this.certificatesService.getMyCertificates((req.user as any).id);
  }

  /** Admin: list all certificates */
  @Get('admin/certificates')
  @UseGuards(JwtAuthGuard)
  getAdminCertificates() {
    return this.certificatesService.getAdminCertificates();
  }

  /** Public: verify a certificate by code */
  @Get('certificates/verify/:code')
  verifyCertificate(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }

  /** View/Download PDF from DB */
  @Get('certificates/view/:id')
  async viewCertificate(@Param('id') id: string, @Res() res: Response) {
    const cert = await this.certificatesService.getCertificateData(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"');
    res.send(cert.pdfData);
  }
}
