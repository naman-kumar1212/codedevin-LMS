
# System Design Document

## Code Devin Solutions — Learning Management System (LMS)

**Version:** 2.0
**Status:** Phase 1 — Production Architecture
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

---

## Table of Contents

1. [System Overview](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#1-system-overview)
2. [Architecture Pattern Decision](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#2-architecture-pattern-decision)
3. [High-Level Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#3-high-level-architecture)
4. [Infrastructure Topology](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#4-infrastructure-topology)
5. [Service &amp; Module Breakdown](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#5-service--module-breakdown)
6. [Data Flow Diagrams](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#6-data-flow-diagrams)
7. [External Service Integrations](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#7-external-service-integrations)
8. [Authentication &amp; Session Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#8-authentication--session-architecture)
9. [Video Delivery Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#9-video-delivery-architecture)
10. [Live Class Recording Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#10-live-class-recording-architecture)
11. [Payment Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#11-payment-architecture)
12. [Background Job Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#12-background-job-architecture)
13. [Storage Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#13-storage-architecture)
14. [Notification Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#14-notification-architecture)
15. [Security Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#15-security-architecture)
16. [Scalability Considerations](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#16-scalability-considerations)
17. [Failure Modes &amp; Resilience](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#17-failure-modes--resilience)

---

## 1. System Overview

The platform is an **admin-controlled LMS** with a student-facing marketplace. A single admin creates and publishes courses, schedules Zoom live sessions, manually uploads session recordings as course lessons, and issues certificates. Students enroll, learn via structured content, complete quizzes, and earn certificates.

### Scale Parameters (Phase 1 Targets)

| Parameter                           | Value             |
| ----------------------------------- | ----------------- |
| Target users (Year 1)               | ~1,000            |
| Concurrent users (live class peaks) | 100–200          |
| Total video content                 | 500–1,000 videos |
| Payment gateway                     | Razorpay only     |
| Video platform                      | Cloudflare Stream |

### System Boundaries

**In scope (Phase 1):**

* Student registration, authentication, and learning
* Admin course creation, video/recording upload, quiz management
* Paid and free enrollment with Razorpay
* Cloudflare Stream video delivery
* Certificate generation and public verification
* Zoom live class scheduling + manual recording upload
* Email (Resend) and in-platform notifications

**Out of scope (Phase 1):**

* Stripe payments
* Automated Zoom recording import
* Tutor accounts and multi-vendor content
* Mobile applications
* Subscription billing

---

## 2. Architecture Pattern Decision

### Decision: Modular Monolith

A **modular monolith** is the correct architecture for this system at Phase 1 scale (~1,000 users).

| Option                     | Verdict            | Reasoning                                                                                                                       |
| -------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Microservices              | Rejected           | Unjustified operational complexity. Multiple deployments, service mesh, distributed tracing — all unnecessary for 1,000 users. |
| Single-file monolith       | Rejected           | No structural separation. Becomes unmaintainable quickly.                                                                       |
| **Modular Monolith** | **Selected** | Single deployable unit. Domain boundaries enforced by NestJS module system. Can be extracted into services post-scaling.        |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   Browser (Desktop / Tablet / Mobile)                           │
│   Next.js 14+ App Router — hosted on Vercel                     │
│   React Query + Zustand + Tailwind + ShadCN                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  API LAYER (NestJS) — Railway                   │
│                                                                 │
│  Auth │ Courses │ Enrollments │ Payments │ Certificates         │
│  Progress │ Quizzes │ Live Classes │ Notifications │ Users      │
│                                                                 │
│  Global: JwtAuthGuard │ RolesGuard │ ThrottlerGuard            │
└──────────┬──────────────────────────────────────────────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
PostgreSQL       Redis
(Railway)    (BullMQ + Rate Limiting)

           │
┌──────────▼─────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│                                                                 │
│  Cloudflare Stream   Cloudflare R2    Zoom API                  │
│  (Video + Recordings) (Files/PDFs)   (Live Classes)             │
│                                                                 │
│  Razorpay            Resend                                     │
│  (Payments — INR)    (Email)                                    │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Infrastructure Topology

### Deployment Targets

| Component                | Hosting                  | Technology                   |
| ------------------------ | ------------------------ | ---------------------------- |
| Backend API              | Railway (container)      | NestJS, Node.js 20, Nixpacks |
| Background Workers       | Railway (worker process) | BullMQ workers               |
| Frontend                 | Vercel                   | Next.js 14+                  |
| Database                 | Railway managed plugin   | PostgreSQL 15                |
| Cache / Queue broker     | Railway managed plugin   | Redis 7                      |
| Video storage & delivery | Cloudflare Stream        | Adaptive streaming CDN       |
| File storage             | Cloudflare R2            | S3-compatible API            |
| Email delivery           | Resend                   | API                          |

### Network Topology

```
Internet
    │
    ├─── HTTPS ──▶ Vercel (Next.js Frontend)
    │                    │
    │                    │ REST API (HTTPS)
    │                    ▼
    └─── HTTPS ──▶ Railway (NestJS Backend)
                         │
              ┌──────────┼──────────────┐
              ▼          ▼              ▼
         PostgreSQL    Redis        External APIs
         (Railway)   (Railway)     (Cloudflare Stream,
                                    Cloudflare R2,
                                    Zoom, Razorpay,
                                    Resend)
```

### Local Development

```
Developer Machine
    │
    ├── Podman: PostgreSQL (port 5432)
    ├── Podman: Redis (port 6379)
    ├── NestJS backend (port 3001)
    ├── Next.js frontend (port 3000)
    └── ngrok tunnel ──▶ Razorpay webhook testing
```

---

## 5. Service & Module Breakdown

| Module            | Responsibility                                      |
| ----------------- | --------------------------------------------------- |
| `auth`          | Register, login, JWT, refresh, email verify         |
| `users`         | Profile management, admin student overview          |
| `courses`       | Course CRUD, publish lifecycle                      |
| `modules`       | Module management inside courses                    |
| `lessons`       | Lesson CRUD (video, recording, resource types)      |
| `progress`      | Lesson completion tracking, course completion check |
| `quizzes`       | Quiz creation, questions, attempt scoring           |
| `enrollments`   | Free enrollment, webhook-triggered paid enrollment  |
| `payments`      | Razorpay session creation + webhook (Stripe absent) |
| `certificates`  | PDF generation, verification, manual issue          |
| `live-classes`  | Zoom API integration, scheduling, recording upload  |
| `notifications` | DB notification center + Resend email dispatch      |
| `workers`       | BullMQ workers for async operations                 |

---

## 6. Data Flow Diagrams

### 6.1 User Registration & Verification

```
Student Browser
    │ POST /auth/register
    ▼
NestJS AuthController
    ├── Validate DTO
    ├── Check email uniqueness
    ├── Hash password (bcrypt, 12 rounds)
    ├── Create user (is_verified=false)
    ├── Generate verification token (UUID, 24h TTL)
    └── Queue verification email → BullMQ → Resend
              │
    Student clicks email link
              │
    GET /auth/verify/:token
              │
    Token validated → user.is_verified = true
```

### 6.2 Paid Course Enrollment (Razorpay)

```
Student clicks "Buy Now"
    │
POST /payments/create { courseId, gateway: "razorpay" }
    │
Backend: razorpay.orders.create({ amount, currency: "INR" })
    │
Returns { orderId, amount, keyId } to frontend
    │
Frontend opens Razorpay checkout modal
    │
Student pays
    │
Razorpay fires: POST /payments/webhook/razorpay
    │
Backend verifies HMAC signature
    │
Create payment record + enrollment record (Prisma $transaction)
    │
Queue: enrollment notification → BullMQ
    │
Student polls GET /courses/:id/access → course unlocked
```

### 6.3 Video Upload (Cloudflare Stream)

```
Admin selects video file
    │
POST /videos/upload-url { filename, type: "video" }
    │
Backend calls Cloudflare Stream API:
POST /accounts/{accountId}/stream/direct_upload
    │
Cloudflare returns { uploadURL, uid }
    │
Returns { uploadUrl, videoId } to admin browser
    │
Admin browser PUTs file directly to uploadUrl
(browser → Cloudflare Stream, no backend involved)
    │
Cloudflare Stream processes → HLS encoding
    │
Admin polls GET /videos/:videoId/status
    │
Status: "ready" → PATCH /lessons/:id { videoId }
    │
videoId stored in lessons table
```

### 6.4 Live Class Recording Upload (Manual Flow)

```
Admin conducts Zoom live session
    │
Zoom session ends
    │
Admin downloads recording from Zoom dashboard manually
    │
Admin opens LMS admin panel → Upload Recording
    │
POST /videos/upload-url { filename, type: "recording" }
    │
Backend calls Cloudflare Stream direct upload API
    │
Admin uploads recording file to Cloudflare Stream
    │
Recording processed → HLS encoding
    │
Admin creates new "recording" lesson in course module:
POST /modules/:moduleId/lessons
{ title: "Week 2 Live Session Recording", type: "recording" }
    │
PATCH /lessons/:id { videoId: cloudflareStreamVideoId }
    │
Students can now watch recording from lesson page
(access follows course enrollment rules)
```

### 6.5 Student Video Playback

```
Student opens lesson page (enrollment verified)
    │
Backend returns lesson data including videoId
    │
Frontend loads Cloudflare Stream player:
https://iframe.cloudflarestream.com/{videoId}
    │
Cloudflare Stream CDN serves adaptive HLS stream
(no backend bandwidth used)
    │
Player fires progress events
    │
watchedPercentage >= 80%:
POST /progress/video { lessonId, watchedPercentage }
    │
Backend marks lesson complete
    │
Backend checks course completion
```

### 6.6 Course Completion & Certificate Generation

```
Final lesson marked complete
    │
ProgressService.checkCourseCompletion(studentId, courseId)
    ├── COUNT completed lessons == total lessons
    └── COUNT passed quizzes == total quizzes
    │
Both conditions met:
Enqueue CertificateGenerationJob (BullMQ)
    │
BullMQ Worker:
    ├── Generate certificate code: CDS-{courseId[:8]}-{userId[:8]}-{YYYY}
    ├── Render React certificate HTML template
    ├── Launch Puppeteer → render to PDF
    ├── Generate QR code → embed in PDF
    ├── Upload PDF to Cloudflare R2
    ├── Create certificate DB record
    └── Enqueue notification → certificate issued
```

### 6.7 Live Class Scheduling

```
Admin creates class: POST /live-classes
    │
NestJS calls Zoom Server-to-Server OAuth → access token
    │
POST /users/me/meetings to Zoom API
    │
Receive { meeting_id, join_url }
    │
Store live_class record in DB
    │
For each enrolled student:
Enqueue NotificationJob → email + in-app notification
```

---

## 7. External Service Integrations

### 7.1 Cloudflare Stream

| Aspect       | Detail                                                                               |
| ------------ | ------------------------------------------------------------------------------------ |
| Purpose      | Video hosting, HLS encoding, CDN delivery for all video and recording lessons        |
| Upload       | Pre-signed direct upload — admin browser uploads directly to Cloudflare             |
| Playback     | Cloudflare Stream iframe embed player                                                |
| Lesson types | `video`and `recording`both use Cloudflare Stream                                 |
| Data stored  | `video_id`string only (never full URL)                                             |
| Key API      | `POST /accounts/{id}/stream/direct_upload`,`GET /accounts/{id}/stream/{videoId}` |

### 7.2 Cloudflare R2

| Aspect  | Detail                                              |
| ------- | --------------------------------------------------- |
| Purpose | Thumbnails, PDFs, resources, certificates, invoices |
| API     | S3-compatible via `@aws-sdk/client-s3`            |
| Upload  | Pre-signed PUT URLs for browser-direct upload       |

### 7.3 Zoom API (v2)

| Aspect      | Detail                                                |
| ----------- | ----------------------------------------------------- |
| Purpose     | Auto-create scheduled live class meetings             |
| Auth        | Server-to-Server OAuth                                |
| Recording   | Manual: admin downloads and uploads to LMS separately |
| Auto-import | Not implemented in Phase 1                            |

### 7.4 Razorpay (Sole Payment Gateway)

| Aspect   | Detail                                              |
| -------- | --------------------------------------------------- |
| Purpose  | All payment processing (INR)                        |
| Security | HMAC-SHA256 signature verification on every webhook |
| Stripe   | Not implemented — entirely absent from codebase    |

### 7.5 Resend

| Aspect    | Detail                        |
| --------- | ----------------------------- |
| Purpose   | Transactional email           |
| Templates | React Email components        |
| Delivery  | Async via BullMQ email worker |

---

## 8. Authentication & Session Architecture

```
Login Response
├── Access Token (JWT, 15m) → HTTP-only cookie
└── Refresh Token (JWT, 7d) → HTTP-only cookie (path restricted to /auth/refresh)
                                └── Hash stored server-side (DB/Redis)
```

Token refresh rotates the refresh token on every use. Frontend middleware (`middleware.ts`) validates the access token using `jose` (Edge-compatible) and redirects by role.

---

## 9. Video Delivery Architecture

### Why Cloudflare Stream

Hosting video on the application server creates three critical failures:

1. **Bandwidth exhaustion** — Railway containers have bandwidth limits
2. **Storage cost** — 500–1,000 videos at 3–8 hours each cannot live on Railway
3. **No CDN** — Without CDN, users far from the server experience buffering

### Cloudflare Stream Flow

```
UPLOAD PATH:
Admin Browser ──(direct upload)──▶ Cloudflare Stream
                                    (encodes to HLS)

PLAYBACK PATH:
Student Browser ◀──(HLS stream)── Cloudflare CDN
                                    ↑
                          NestJS returns videoId only
                          (no video data through backend)
```

### Unified Handling for video and recording Lessons

Both `video` and `recording` lesson types use identical infrastructure:

* Same Cloudflare Stream upload flow
* Same `video_id` storage in the `lessons` table
* Same player component on the frontend (`CloudflareStreamPlayer`)
* Same 80% progress tracking logic

The only difference is semantic: `recording` lessons originate from Zoom sessions downloaded and re-uploaded by the admin.

---

## 10. Live Class Recording Architecture

### Manual Recording Upload Flow

```
Phase 1: Zoom Session
Admin conducts Zoom live class
    │
Zoom session ends → recording available in Zoom cloud dashboard
    │
Admin downloads recording manually from Zoom dashboard

Phase 2: LMS Upload
Admin uploads recording via LMS admin panel
    │
Backend generates Cloudflare Stream pre-signed upload URL
    │
Admin uploads recording to Cloudflare Stream directly
    │
Recording is encoded and available

Phase 3: Lesson Creation
Admin creates a "recording" lesson in a course module
    │
Recording lesson behaves identically to a video lesson:
  - Enrolled students can watch
  - 80% progress = lesson complete
  - Access follows enrollment rules (free/paid)
```

### What Is NOT Implemented in Phase 1

* Automatic Zoom webhook to detect recording availability
* Automatic download from Zoom cloud storage
* Automatic upload to Cloudflare Stream
* All of the above are Phase 2 enhancements

---

## 11. Payment Architecture

### Critical Rule

> Enrollment is **ONLY** created after the backend verifies the Razorpay webhook HMAC signature. Frontend payment success signals are never trusted.

### Payment State Machine

```
INITIAL
    │ Student clicks "Buy Now"
    ▼
PAYMENT_INITIATED
(Razorpay order created)
    │ Student completes checkout
    ▼
PAYMENT_PENDING
    │ Razorpay webhook arrives
    ├── Signature valid → PAYMENT_SUCCESS → Enrollment created
    └── No webhook / failure → PAYMENT_FAILED
```

### Razorpay Sequence

```
1. POST /payments/create { courseId, gateway: "razorpay" }
   └── razorpay.orders.create({ amount, currency: "INR" })
   └── Returns: { orderId, amount, keyId }

2. Frontend opens Razorpay.js checkout modal

3. Student pays

4. POST /payments/webhook/razorpay (Razorpay fires)
   └── Verify HMAC: SHA256(orderId + "|" + paymentId, secret)
   └── Prisma $transaction: create payment + create enrollment

5. Frontend polls GET /courses/:id/access → course unlocked
```

### Idempotency

Before creating enrollment: check if `(student_id, course_id)` already exists. If yes, return 200 (already processed). This prevents duplicate enrollments on webhook retry.

---

## 12. Background Job Architecture

### Queue Design

```
NestJS API Thread
    │ enqueue job, return immediately
    ▼
Redis (BullMQ Broker)
    ├── certificate-generation queue
    ├── email-dispatch queue
    └── notifications queue

BullMQ Worker Process
    ├── CertificateWorker  → Puppeteer + PDF + R2 + DB
    ├── EmailWorker        → Resend API
    └── NotificationWorker → DB insert + email enqueue
```

### Queue Names and Payloads

| Queue                      | Payload                           | Worker Action                                     |
| -------------------------- | --------------------------------- | ------------------------------------------------- |
| `certificate-generation` | `{ studentId, courseId }`       | Generate PDF, upload R2, update DB, enqueue email |
| `email-dispatch`         | `{ to, template, data }`        | Render template, send via Resend                  |
| `notifications`          | `{ userIds[], title, message }` | Create DB records, enqueue emails                 |

---

## 13. Storage Architecture

| Asset                 | Storage           | Access                              |
| --------------------- | ----------------- | ----------------------------------- |
| Course videos         | Cloudflare Stream | CDN embed player                    |
| Live class recordings | Cloudflare Stream | CDN embed player (same as video)    |
| Course thumbnails     | Cloudflare R2     | Public read                         |
| Resource files (PDFs) | Cloudflare R2     | Authenticated (enrollment required) |
| Certificate PDFs      | Cloudflare R2     | Public read (opaque URL)            |
| Invoice PDFs          | Cloudflare R2     | Authenticated (student + admin)     |

---

## 14. Notification Architecture

### Event-Driven Trigger Map

| Event                | Source Module      | Channels       |
| -------------------- | ------------------ | -------------- |
| Account verified     | AuthModule         | Email          |
| Course enrolled      | EnrollmentModule   | Email + In-app |
| Payment confirmed    | PaymentsModule     | Email + In-app |
| Live class scheduled | LiveClassesModule  | Email + In-app |
| Certificate issued   | CertificatesModule | Email + In-app |

All notifications are dispatched asynchronously via BullMQ workers.

---

## 15. Security Architecture

```
Layer 1: Network
├── HTTPS enforced everywhere
├── CORS restricted to Vercel frontend origin
└── Helmet.js security headers

Layer 2: Authentication
├── JWT in HTTP-only Secure SameSite=Strict cookies
├── Refresh token rotation
└── Rate limiting on /auth/login (5 req/min/IP)

Layer 3: Authorisation
├── JwtAuthGuard on all protected routes
├── RolesGuard enforcing admin/student separation
└── Next.js middleware for client-side redirect

Layer 4: Input Validation
├── NestJS class-validator DTOs
└── Prisma parameterised queries (SQL injection prevention)

Layer 5: Payment Security
├── Razorpay HMAC-SHA256 webhook signature verification
└── Idempotency check before enrollment creation

Layer 6: Application
├── Helmet.js HTTP security headers
└── Rate limiting via @nestjs/throttler + Redis
```

### Rate Limiting

| Endpoint                      | Limit        | Window    |
| ----------------------------- | ------------ | --------- |
| `POST /auth/login`          | 5 requests   | 1 minute  |
| `POST /auth/register`       | 3 requests   | 1 minute  |
| `POST /payments/create`     | 10 requests  | 1 minute  |
| `POST /quizzes/:id/attempt` | 10 requests  | 5 minutes |
| General API                   | 100 requests | 1 minute  |

---

## 16. Scalability Considerations

### Phase 1 Capacity

At ~1,000 users with typical LMS usage patterns, the Railway single-container setup has ample headroom. Cloudflare Stream handles all video bandwidth independently.

### Scaling Path (Post Phase 1)

1. **Vertical scaling** — Increase Railway container RAM/CPU. Zero architecture change.
2. **Read replicas** — PostgreSQL read replica for course listing and analytics.
3. **Horizontal API scaling** — Railway multi-replica; sessions/tokens fully in Redis.
4. **Module extraction** — High-traffic modules become separate Railway services.
5. **Automated recording import** — Zoom webhook → auto-upload to Cloudflare Stream (Phase 2).

### Database Indexes

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_status ON courses(status);
CREATE UNIQUE INDEX idx_enrollments_student_course ON enrollments(student_id, course_id);
CREATE UNIQUE INDEX idx_lesson_progress_student_lesson ON lesson_progress(student_id, lesson_id);
CREATE INDEX idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);
CREATE UNIQUE INDEX idx_certificates_code ON certificates(certificate_code);
CREATE UNIQUE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
```

---

## 17. Failure Modes & Resilience

| Failure                            | Detection                     | Response                                                  |
| ---------------------------------- | ----------------------------- | --------------------------------------------------------- |
| Zoom API unavailable               | HTTP 5xx from Zoom            | Return error to admin; allow retry from dashboard         |
| Razorpay webhook not delivered     | Student sees "pending"        | Idempotency handles delayed retry; admin manual reconcile |
| Puppeteer PDF fails                | BullMQ job fails              | Retry 3× with backoff; admin can re-trigger manually     |
| Email delivery fails               | BullMQ job fails              | Retry 3×; does not block enrollment or certificate       |
| Redis unavailable                  | BullMQ cannot connect         | Sync operations continue; async jobs queue in memory      |
| Cloudflare Stream upload fails     | SDK throws error              | Return error to admin; no DB record created               |
| Cloudflare Stream processing delay | Status API returns processing | Frontend shows "Video processing" state                   |

### Health Check Endpoint

```
GET /health
→ { "status": "ok", "database": "connected", "redis": "connected" }
```

Used by Railway for container health monitoring.

---

*End of System Design Document v2.0*
