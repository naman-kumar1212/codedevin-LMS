import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Request, @Body() body: { courseId: string }) {
    return this.paymentsService.createOrder((req.user as any).id, body.courseId);
  }

  @Post('webhook/razorpay')
  webhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const raw = (req as any).rawBody?.toString() ?? '{}';
    return this.paymentsService.handleWebhook(raw, signature);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAll() {
    return this.paymentsService.getAll();
  }
}
