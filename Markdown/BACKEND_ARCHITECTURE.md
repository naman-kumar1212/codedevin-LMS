
# Backend Architecture Document

## Code Devin Solutions — Learning Management System (LMS)

**Version:** 2.0
**Status:** Phase 1 — Production Specification
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

---

## Table of Contents

1. [Architecture Overview](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#1-architecture-overview)
2. [Project Structure](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#2-project-structure)
3. [Application Bootstrap](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#3-application-bootstrap)
4. [Module Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#4-module-architecture)
5. [Auth Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#5-auth-module)
6. [Courses Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#6-courses-module)
7. [Lessons Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#7-lessons-module)
8. [Progress Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#8-progress-module)
9. [Quizzes Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#9-quizzes-module)
10. [Enrollments Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#10-enrollments-module)
11. [Payments Module (Razorpay Only)](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#11-payments-module)
12. [Certificates Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#12-certificates-module)
13. [Live Classes Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#13-live-classes-module)
14. [Notifications Module](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#14-notifications-module)
15. [Guard Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#15-guard-architecture)
16. [Global Middleware &amp; Pipes](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#16-global-middleware--pipes)
17. [Background Job Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#17-background-job-architecture)
18. [External Service Wrappers](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#18-external-service-wrappers)
19. [Error Handling Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#19-error-handling-architecture)
20. [Request Lifecycle](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#20-request-lifecycle)
21. [Configuration Management](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#21-configuration-management)

---

## 1. Architecture Overview

The backend is a **NestJS modular monolith** deployed as a single Node.js process on Railway. It exposes a REST API consumed by the Next.js frontend.

### Core Design Rules

| Rule                             | Enforcement                                                             |
| -------------------------------- | ----------------------------------------------------------------------- |
| Domain isolation                 | Each domain is a NestJS module with its own controllers, services, DTOs |
| Single database entry point      | `PrismaService`injected into each service                             |
| No business logic in controllers | Controllers validate input, call service, return result                 |
| Async operations via queues      | Certificate generation, email, notification fan-out via BullMQ          |
| Secrets via ConfigService        | No hardcoded credentials anywhere                                       |
| Razorpay only                    | No Stripe code, no Stripe npm package, no Stripe references             |

### Technology Summary

| Technology        | Role                                       |
| ----------------- | ------------------------------------------ |
| NestJS            | Backend framework                          |
| Prisma            | ORM + migrations                           |
| PostgreSQL        | Database                                   |
| Redis + BullMQ    | Async job queues + rate limiting           |
| Cloudflare Stream | Video and recording upload/streaming       |
| Cloudflare R2     | File storage (thumbnails, PDFs, resources) |
| Razorpay          | Payment processing (only)                  |
| Zoom API          | Live class meeting creation                |
| Resend            | Transactional email                        |
| Puppeteer         | Certificate PDF generation                 |

---

## 2. Project Structure

```
lms-backend/
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── refresh-auth.guard.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.service.ts
│   │   │
│   │   ├── courses/
│   │   │   ├── courses.module.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── modules.controller.ts
│   │   │   ├── lessons.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── modules.service.ts
│   │   │   ├── lessons.service.ts
│   │   │   └── dto/
│   │   │       ├── create-course.dto.ts
│   │   │       ├── create-module.dto.ts
│   │   │       └── create-lesson.dto.ts
│   │   │
│   │   ├── enrollments/
│   │   │   ├── enrollments.module.ts
│   │   │   └── enrollments.service.ts
│   │   │
│   │   ├── progress/
│   │   │   ├── progress.module.ts
│   │   │   ├── progress.controller.ts
│   │   │   ├── progress.service.ts
│   │   │   └── dto/
│   │   │       ├── video-progress.dto.ts
│   │   │       └── resource-complete.dto.ts
│   │   │
│   │   ├── quizzes/
│   │   │   ├── quizzes.module.ts
│   │   │   ├── quizzes.controller.ts
│   │   │   ├── quizzes.service.ts
│   │   │   └── dto/
│   │   │       ├── create-quiz.dto.ts
│   │   │       ├── create-question.dto.ts
│   │   │       └── submit-attempt.dto.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.controller.ts
│   │   │   └── razorpay.service.ts
│   │   │   // NOTE: No stripe.service.ts — Stripe is not implemented
│   │   │
│   │   ├── certificates/
│   │   │   ├── certificates.module.ts
│   │   │   ├── certificates.controller.ts
│   │   │   └── certificates.service.ts
│   │   │
│   │   ├── live-classes/
│   │   │   ├── live-classes.module.ts
│   │   │   ├── live-classes.controller.ts
│   │   │   ├── live-classes.service.ts
│   │   │   └── zoom.service.ts
│   │   │
│   │   └── notifications/
│   │       ├── notifications.module.ts
│   │       ├── notifications.controller.ts
│   │       ├── notifications.service.ts
│   │       └── email.service.ts
│   │
│   ├── workers/
│   │   ├── workers.module.ts
│   │   ├── certificate.worker.ts
│   │   ├── email.worker.ts
│   │   └── notification.worker.ts
│   │
│   ├── infrastructure/
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── redis/
│   │   │   └── redis.module.ts
│   │   ├── cloudflare-stream/
│   │   │   └── cloudflare-stream.service.ts
│   │   ├── storage/
│   │   │   └── r2-storage.service.ts
│   │   └── pdf/
│   │       └── pdf.service.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   └── interceptors/
│   │       └── response-transform.interceptor.ts
│   │
│   └── config/
│       └── configuration.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── package.json
```

---

## 3. Application Bootstrap

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Exclude webhook routes from global JSON parsing
  // (raw body needed for Razorpay HMAC signature verification)
  app.use(
    '/api/v1/payments/webhook/razorpay',
    express.raw({ type: 'application/json' })
  );

  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3001);
}
```

---

## 4. Module Architecture

### PrismaModule (Global)

```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

`PrismaService` extends `PrismaClient` and is injected into all domain services.

### Module Dependencies

```
AuthModule          → UsersModule, NotificationsModule
CoursesModule       → CloudflareStreamService, R2StorageService
ProgressModule      → CertificatesModule (triggers generation)
PaymentsModule      → EnrollmentsModule, NotificationsModule, PdfService, R2StorageService
CertificatesModule  → WorkersModule (queues PDF job)
LiveClassesModule   → ZoomService, NotificationsModule
NotificationsModule → WorkersModule (queues email job)
```

---

## 5. Auth Module

### Key Service Methods

```typescript
@Injectable()
export class AuthService {
  async register(dto: RegisterDto): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = crypto.randomUUID();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: 'student',
        isVerified: false,
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      }
    });

    await this.notificationsService.queueEmail({
      to: dto.email,
      template: 'verification',
      data: { name: dto.name, verificationUrl: `...` }
    });
  }

  async login(dto: LoginDto, res: Response): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isVerified) throw new ForbiddenException('Email not verified');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.role);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: refreshHash } });
    this.setTokenCookies(res, accessToken, refreshToken);
  }

  async refresh(userId: string, refreshToken: string, res: Response): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshTokenHash) throw new UnauthorizedException();
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException();
    const tokens = await this.generateTokens(user.id, user.role);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: newHash } });
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
  }
}
```

---

## 6. Courses Module

### Publish Validation

```typescript
async publish(courseId: string) {
  const course = await this.prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: true } } }
  });

  if (!course) throw new NotFoundException('Course not found');
  if (course.modules.length === 0)
    throw new BadRequestException('Course must have at least one module');

  for (const module of course.modules) {
    if (module.lessons.length === 0)
      throw new BadRequestException(`Module "${module.title}" must have at least one lesson`);

    for (const lesson of module.lessons) {
      // video and recording lessons must have a videoId
      if ((lesson.type === 'video' || lesson.type === 'recording') && !lesson.videoId)
        throw new BadRequestException(`Lesson "${lesson.title}" is missing a video`);
      // resource lessons must have a resourceUrl
      if (lesson.type === 'resource' && !lesson.resourceUrl)
        throw new BadRequestException(`Lesson "${lesson.title}" is missing a resource file`);
    }
  }

  return this.prisma.course.update({ where: { id: courseId }, data: { status: 'published' } });
}
```

---

## 7. Lessons Module

### Create Lesson with Type Validation

```typescript
async create(moduleId: string, dto: CreateLessonDto) {
  // Validate type
  if (!['video', 'recording', 'resource'].includes(dto.type)) {
    throw new BadRequestException('Invalid lesson type');
  }

  const maxOrder = await this.prisma.lesson.aggregate({
    where: { moduleId },
    _max: { orderIndex: true }
  });

  return this.prisma.lesson.create({
    data: {
      moduleId,
      title: dto.title,
      type: dto.type,
      orderIndex: (maxOrder._max.orderIndex ?? 0) + 1,
    }
  });
}

// Access check — same logic for video, recording, and resource
async findOneWithAccess(lessonId: string, studentId: string) {
  const lesson = await this.prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } }
  });
  if (!lesson) throw new NotFoundException('Lesson not found');

  const enrollment = await this.prisma.enrollment.findFirst({
    where: { studentId, courseId: lesson.module.courseId }
  });
  if (!enrollment) throw new ForbiddenException('Not enrolled in this course');

  return lesson;
  // For video/recording: lesson.videoId used by player
  // For resource: lesson.resourceUrl used for download
}
```

---

## 8. Progress Module

### Progress Recording — Handles video and recording Identically

```typescript
async recordVideoProgress(studentId: string, dto: VideoProgressDto) {
  const lesson = await this.prisma.lesson.findUnique({
    where: { id: dto.lessonId },
    include: { module: { select: { courseId: true } } }
  });
  if (!lesson) throw new NotFoundException('Lesson not found');

  // Works for both video and recording lesson types
  if (lesson.type !== 'video' && lesson.type !== 'recording') {
    throw new BadRequestException('Lesson is not a video or recording type');
  }

  const enrollment = await this.prisma.enrollment.findFirst({
    where: { studentId, courseId: lesson.module.courseId }
  });
  if (!enrollment) throw new ForbiddenException('Not enrolled');

  if (dto.watchedPercentage >= 80) {
    await this.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId, lessonId: dto.lessonId } },
      create: { studentId, lessonId: dto.lessonId, isCompleted: true, completedAt: new Date() },
      update: { isCompleted: true, completedAt: new Date() },
    });
    await this.checkCourseCompletion(studentId, lesson.module.courseId);
  }
}
```

### Course Completion Check

```typescript
private async checkCourseCompletion(studentId: string, courseId: string) {
  const totalLessons = await this.prisma.lesson.count({
    where: { module: { courseId } }
  });
  const completedLessons = await this.prisma.lessonProgress.count({
    where: { studentId, isCompleted: true, lesson: { module: { courseId } } }
  });
  if (completedLessons < totalLessons) return;

  const totalQuizzes = await this.prisma.quiz.count({
    where: { lesson: { module: { courseId } } }
  });
  const passedQuizzes = await this.prisma.quizAttempt.count({
    where: { studentId, isPassed: true, quiz: { lesson: { module: { courseId } } } }
  });
  if (passedQuizzes < totalQuizzes) return;

  const existing = await this.prisma.certificate.findFirst({
    where: { studentId, courseId }
  });
  if (existing) return;

  await this.certificatesService.triggerGeneration(studentId, courseId);
}
```

---

## 9. Quizzes Module

### Submit Attempt (MCQ Scoring)

```typescript
async submitAttempt(quizId: string, studentId: string, dto: SubmitAttemptDto) {
  const attemptsUsed = await this.prisma.quizAttempt.count({
    where: { quizId, studentId }
  });
  if (attemptsUsed >= 3) throw new ForbiddenException('Maximum quiz attempts reached');

  const quiz = await this.prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } }
  });
  if (!quiz) throw new NotFoundException('Quiz not found');

  let correctCount = 0;
  const totalMcq = quiz.questions.filter(q => q.questionType === 'mcq').length;

  for (const question of quiz.questions) {
    if (question.questionType === 'mcq') {
      const selectedId = dto.answers[question.id];
      const correct = question.options.find(o => o.isCorrect);
      if (correct && selectedId === correct.id) correctCount++;
    }
    // short_answer: recorded but not scored
  }

  const score = totalMcq > 0 ? Math.round((correctCount / totalMcq) * 100) : 100;
  const isPassed = score >= quiz.passingScore;

  await this.prisma.quizAttempt.create({
    data: { studentId, quizId, score, isPassed, attemptedAt: new Date() }
  });

  return {
    score,
    isPassed,
    attemptsRemaining: 3 - (attemptsUsed + 1),
    passingScore: quiz.passingScore
  };
}
```

---

## 10. Enrollments Module

```typescript
async enrollFree(studentId: string, courseId: string) {
  const course = await this.prisma.course.findUnique({
    where: { id: courseId, status: 'published' }
  });
  if (!course) throw new NotFoundException('Course not found');
  if (!course.isFree) throw new ForbiddenException('This course requires payment');

  const existing = await this.prisma.enrollment.findFirst({
    where: { studentId, courseId }
  });
  if (existing) throw new ConflictException('Already enrolled');

  const enrollment = await this.prisma.enrollment.create({
    data: { studentId, courseId, enrolledAt: new Date() }
  });

  await this.notificationsService.queueNotification({
    userId: studentId,
    type: 'enrollment',
    data: { courseTitle: course.title }
  });

  return enrollment;
}

async createFromPayment(studentId: string, courseId: string, paymentId: string) {
  // Idempotency guard
  const existing = await this.prisma.enrollment.findFirst({
    where: { studentId, courseId }
  });
  if (existing) return existing;

  return this.prisma.enrollment.create({
    data: { studentId, courseId, paymentId, enrolledAt: new Date() }
  });
}
```

---

## 11. Payments Module

### Razorpay Only — No Stripe

```typescript
// payments.controller.ts
@Controller('payments')
export class PaymentsController {
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  createPayment(@Body() dto: CreatePaymentDto, @CurrentUser('userId') studentId: string) {
    // Only Razorpay — no gateway selection
    return this.razorpayService.createOrder(studentId, dto.courseId);
  }

  // Raw body required for HMAC verification
  @Post('webhook/razorpay')
  @HttpCode(200)
  razorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() rawBody: Buffer,
  ) {
    return this.razorpayService.handleWebhook(signature, rawBody);
  }
}
```

### Razorpay Service

```typescript
@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    private enrollmentsService: EnrollmentsService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {
    this.razorpay = new Razorpay({
      key_id: configService.get('razorpay.keyId'),
      key_secret: configService.get('razorpay.keySecret'),
    });
  }

  async createOrder(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, status: 'published', isFree: false }
    });
    if (!course) throw new NotFoundException('Course not found or is free');

    const order = await this.razorpay.orders.create({
      amount: course.price,  // already in paise
      currency: 'INR',
      receipt: `course_${courseId}_student_${studentId}`,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: this.configService.get('razorpay.keyId'),
    };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get('razorpay.webhookSecret');

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody.toString())
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;

      // Idempotency: check if already processed
      const existing = await this.prisma.payment.findFirst({
        where: { razorpayPaymentId: payment.id }
      });
      if (existing) return;

      const order = await this.razorpay.orders.fetch(payment.order_id);
      const [, courseId, , studentId] = order.receipt.split('_');

      await this.prisma.$transaction(async (tx) => {
        const paymentRecord = await tx.payment.create({
          data: {
            studentId,
            courseId,
            razorpayOrderId: payment.order_id,
            razorpayPaymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'completed',
          }
        });

        await this.enrollmentsService.createFromPayment(
          studentId, courseId, paymentRecord.id
        );
      });

      await this.notificationsService.queueNotification({
        userId: studentId,
        type: 'payment',
        data: { courseId }
      });
    }
  }
}
```

---

## 12. Certificates Module

```typescript
@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('certificate-generation') private certQueue: Queue,
  ) {}

  async triggerGeneration(studentId: string, courseId: string) {
    await this.certQueue.add(
      'generate',
      { studentId, courseId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        jobId: `cert_${studentId}_${courseId}`,  // Prevents duplicate jobs
      }
    );
  }

  async verify(certificateCode: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateCode },
      include: {
        student: { select: { name: true } },
        course: { select: { title: true } }
      }
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
}
```

---

## 13. Live Classes Module

### Zoom Service with Token Refresh

```typescript
@Injectable()
export class ZoomService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }
    const credentials = Buffer.from(
      `${this.configService.get('zoom.clientId')}:${this.configService.get('zoom.clientSecret')}`
    ).toString('base64');

    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.configService.get('zoom.accountId')}`,
      null,
      { headers: { Authorization: `Basic ${credentials}` } }
    );
    this.accessToken = response.data.access_token;
    this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
    return this.accessToken;
  }

  async createMeeting(options: CreateMeetingOptions) {
    const token = await this.getAccessToken();
    try {
      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: options.title,
          type: 2,
          start_time: options.scheduledAt.toISOString(),
          duration: options.durationMinutes,
          settings: {
            host_video: true,
            participant_video: true,
            waiting_room: true,
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return {
        meetingId: String(response.data.id),
        joinUrl: response.data.join_url,
      };
    } catch {
      throw new ServiceUnavailableException('Failed to create Zoom meeting. Please try again.');
    }
  }
}
```

### Live Classes Service — Manual Recording Upload

```typescript
@Injectable()
export class LiveClassesService {
  async attachRecording(classId: string, dto: AttachRecordingDto) {
    // Admin uploads recording to Cloudflare Stream separately,
    // then creates a recording lesson in the course.
    // This endpoint optionally stores the recording URL on the
    // live_class record for reference.
    return this.prisma.liveClass.update({
      where: { id: classId },
      data: { recordingUrl: dto.recordingUrl }
    });
  }
}
```

---

## 14. Notifications Module

```typescript
@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
    @InjectQueue('email-dispatch') private emailQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queueNotification(options: QueueNotificationOptions) {
    await this.notificationQueue.add('create', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });
  }

  async queueEmail(options: QueueEmailOptions) {
    await this.emailQueue.add('send', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }
}
```

---

## 15. Guard Architecture

```typescript
// common/decorators/roles.decorator.ts
export const Roles = (...roles: ('admin' | 'student')[]) =>
  SetMetadata('roles', roles);

// common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    return data ? user?.[data] : user;
  }
);
```

### Controller Usage Pattern

```typescript
@Controller('courses')
export class CoursesController {
  // Public
  @Get()
  findAll(@Query() query: CourseFilterDto) {
    return this.coursesService.findAll(query);
  }

  // Admin only
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(
    @Body() dto: CreateCourseDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.coursesService.create(dto, adminId);
  }

  // Student only
  @Post(':courseId/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  enroll(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.enrollmentsService.enrollFree(studentId, courseId);
  }
}
```

---

## 16. Global Middleware & Pipes

### Standard API Response Envelope

**Success:**

```json
{ "success": true, "data": { ... }, "timestamp": "2026-01-15T10:30:00.000Z" }
```

**Error:**

```json
{ "success": false, "statusCode": 403, "code": "FORBIDDEN", "message": "...", "timestamp": "..." }
```

All responses wrapped by `ResponseTransformInterceptor`. All errors standardised by `GlobalExceptionFilter`.

---

## 17. Background Job Architecture

### Certificate Worker

```typescript
@Processor('certificate-generation')
export class CertificateWorker extends WorkerHost {
  @Process('generate')
  async handleGeneration(job: Job<{ studentId: string; courseId: string }>) {
    const { studentId, courseId } = job.data;

    const [student, course] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: studentId } }),
      this.prisma.course.findUnique({ where: { id: courseId } }),
    ]);

    const year = new Date().getFullYear();
    const certificateCode =
      `CDS-${courseId.slice(0, 8).toUpperCase()}-${studentId.slice(0, 8).toUpperCase()}-${year}`;

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${certificateCode}`;
    const qrCodeBase64 = await QRCode.toDataURL(verifyUrl);

    const pdfBuffer = await this.pdfService.generateCertificate({
      studentName: student.name,
      courseName: course.title,
      issuedDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      certificateCode,
      qrCodeBase64,
    });

    const pdfKey = `certificates/${certificateCode}/certificate.pdf`;
    const pdfUrl = await this.r2Storage.upload(pdfKey, pdfBuffer, 'application/pdf');

    await this.prisma.certificate.create({
      data: { studentId, courseId, certificateCode, pdfUrl, issuedAt: new Date() }
    });

    await this.notificationsService.queueNotification({
      userId: studentId,
      type: 'certificate',
      data: { courseName: course.title, certificateCode, pdfUrl }
    });
  }
}
```

---

## 18. External Service Wrappers

### CloudflareStreamService

```typescript
@Injectable()
export class CloudflareStreamService {
  private readonly accountId: string;
  private readonly apiToken: string;

  constructor(private configService: ConfigService) {
    this.accountId = configService.get('cloudflare.accountId');
    this.apiToken = configService.get('cloudflare.streamApiToken');
  }

  async createDirectUploadUrl(filename: string): Promise<{ uploadUrl: string; videoId: string }> {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/direct_upload`,
      {
        maxDurationSeconds: 21600, // 6 hours max
        expiry: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2-hour upload window
        meta: { name: filename }
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return {
      uploadUrl: response.data.result.uploadURL,
      videoId: response.data.result.uid,
    };
  }

  async getVideoStatus(videoId: string): Promise<{ status: string; readyToStream: boolean }> {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}`,
      { headers: { Authorization: `Bearer ${this.apiToken}` } }
    );

    return {
      status: response.data.result.status.state,
      readyToStream: response.data.result.readyToStream,
    };
  }
}
```

**Note:** Both `video` and `recording` lesson types use the identical `createDirectUploadUrl` method. The lesson `type` is a semantic label, not a separate upload pathway.

### R2StorageService

```typescript
@Injectable()
export class R2StorageService {
  private client: S3Client;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${configService.get('r2.accountId')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: configService.get('r2.accessKeyId'),
        secretAccessKey: configService.get('r2.secretAccessKey'),
      },
    });
  }

  async generateUploadUrl(type: string, referenceId: string) {
    const key = `${type}s/${referenceId}/${Date.now()}`;
    const command = new PutObjectCommand({
      Bucket: this.configService.get('r2.bucketName'),
      Key: key
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 7200 });
    return { uploadUrl, publicUrl: `${this.configService.get('r2.publicUrl')}/${key}` };
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.configService.get('r2.bucketName'),
      Key: key,
      Body: body,
      ContentType: contentType,
    }));
    return `${this.configService.get('r2.publicUrl')}/${key}`;
  }
}
```

---

## 19. Error Handling Architecture

| Exception                       | HTTP Status | When to Use                                 |
| ------------------------------- | ----------- | ------------------------------------------- |
| `BadRequestException`         | 400         | Invalid input, business rule violation      |
| `UnauthorizedException`       | 401         | Missing or invalid auth token               |
| `ForbiddenException`          | 403         | Insufficient role, not enrolled, quiz limit |
| `NotFoundException`           | 404         | Resource does not exist                     |
| `ConflictException`           | 409         | Duplicate (already enrolled, email taken)   |
| `ServiceUnavailableException` | 503         | External service failure (Zoom)             |

---

## 20. Request Lifecycle

```
1. HTTP Request → Railway container
2. Express middleware (helmet, cookieParser, CORS)
3. ThrottlerGuard (rate limit check)
4. NestJS Router (match route to controller)
5. JwtAuthGuard (validate JWT from cookie)
6. RolesGuard (check role if @Roles decorator present)
7. ValidationPipe (validate and transform DTO)
8. Controller (call service)
9. Service (Prisma queries + business logic + queue jobs)
10. ResponseTransformInterceptor (wrap in { success, data, timestamp })
11. HTTP Response returned to client
```

---

## 21. Configuration Management

```typescript
// config/configuration.ts
export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  frontendUrl: process.env.FRONTEND_URL,

  database: { url: process.env.DATABASE_URL },

  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },

  redis: { url: process.env.REDIS_URL },

  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    streamApiToken: process.env.CLOUDFLARE_STREAM_API_TOKEN,
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
  },

  zoom: {
    accountId: process.env.ZOOM_ACCOUNT_ID,
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  email: { resendApiKey: process.env.RESEND_API_KEY },
});
// NOTE: No Stripe configuration — Stripe is not implemented.
```

---

*End of Backend Architecture Document v2.0*
