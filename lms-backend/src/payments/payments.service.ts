import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

type RazorpayInstance = { orders: { create: (opts: any) => Promise<any> } };

@Injectable()
export class PaymentsService {
  private razorpay: RazorpayInstance | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Lazy-load Razorpay to avoid crash when keys are mock
    try {
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({
        key_id: this.config.get('RAZORPAY_KEY_ID'),
        key_secret: this.config.get('RAZORPAY_KEY_SECRET'),
      });
    } catch {
      console.warn('[Payments] Razorpay not available — using mock mode');
    }
  }

  async createOrder(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const amountPaisa = Math.round(course.price * 100);

    let razorpayOrderId = `mock_order_${Date.now()}`;

    if (this.razorpay) {
      const order = await this.razorpay.orders.create({
        amount: amountPaisa,
        currency: 'INR',
        receipt: `lms_${courseId}_${studentId}`.slice(0, 40),
      });
      razorpayOrderId = order.id;
    }

    const payment = await this.prisma.payment.create({
      data: { studentId, courseId, razorpayOrderId, amount: course.price, status: 'PENDING' },
    });

    return { paymentId: payment.id, razorpayOrderId, amount: amountPaisa, currency: 'INR' };
  }

  async handleWebhook(rawBody: string, signature: string) {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (signature !== expected) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'payment.captured') {
      const { order_id, id: transactionId } = payload.payload.payment.entity;

      const payment = await this.prisma.payment.findFirst({
        where: { razorpayOrderId: order_id },
      });

      if (payment && payment.status === 'PENDING') {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'SUCCESS', transactionId },
          }),
          this.prisma.enrollment.create({
            data: { studentId: payment.studentId, courseId: payment.courseId },
          }),
        ]);
      }
    }

    return { received: true };
  }

  async getAll() {
    return this.prisma.payment.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
