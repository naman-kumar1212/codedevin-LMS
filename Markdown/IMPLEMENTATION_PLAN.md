# Implementation Plan
## Codedevin Solutions — Learning Management System (LMS)
**Version:** 2.0  
**Status:** Phase 1 — Engineering Execution Plan  
**Last Updated:** 2026  
**Document Owner:** Codedevin Solutions Engineering Team

---

## Migration Notes: v1.0 → v2.0

This document supersedes Implementation Plan v1.0. The following breaking changes were introduced in v2.0 and must be respected across the entire codebase:

| Area | v1.0 | v2.0 | Action Required |
|---|---|---|---|
| Video platform | Bunny Stream | **Cloudflare Stream** | Replace all Bunny API calls and env vars |
| Payment gateways | Razorpay + Stripe | **Razorpay only** | Remove all Stripe code, packages, env vars |
| Lesson types | `video`, `resource` | **`video`, `recording`, `resource`** | Add `recording` type to schema and all lesson flows |
| Video env vars | `BUNNY_API_KEY`, `BUNNY_LIBRARY_ID`, `BUNNY_CDN_HOSTNAME` | **`CF_STREAM_ACCOUNT_ID`, `CF_STREAM_API_TOKEN`** | Rotate credentials; update `.env.example` |
| Video upload API | `POST /videos/upload-url` (Bunny-backed) | **`POST /videos/upload-url`** (Cloudflare Stream-backed) | Rewrite service implementation |
| Video player component | Bunny Stream player | **Cloudflare Stream iframe embed** | Replace frontend player component |
| Stripe env vars | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | **Removed** | Delete from all configs and docs |
| Payment endpoint | `POST /payments/create` accepted `gateway: stripe` | **Gateway field locked to `razorpay`** | Remove gateway validation for stripe |
| Recording upload | Not supported | **Admin uploads Zoom recordings as `recording` lessons** | New admin UI panel + API flow |

> **Historical note (preserved):** The decision to support Stripe was made in v1.0 for international payments. This was rescoped in v2.0 — INR-only via Razorpay is the confirmed Phase 1 constraint. Stripe may be revisited in a future phase.

---

## Table of Contents

1. [Implementation Philosophy](#1-implementation-philosophy)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Phase Overview](#3-phase-overview)
4. [Phase 0 — Project Scaffolding](#4-phase-0--project-scaffolding)
5. [Phase 1 — Authentication & Core Infrastructure](#5-phase-1--authentication--core-infrastructure)
6. [Phase 2 — Course System & Video Pipeline](#6-phase-2--course-system--video-pipeline)
7. [Phase 3 — Enrollment & Payment Integration](#7-phase-3--enrollment--payment-integration)
8. [Phase 4 — Learning Experience (Quizzes, Progress, Certificates)](#8-phase-4--learning-experience)
9. [Phase 5 — Live Classes & Notifications](#9-phase-5--live-classes--notifications)
10. [Phase 6 — Admin Dashboard & Analytics](#10-phase-6--admin-dashboard--analytics)
11. [Phase 7 — Frontend Student Experience](#11-phase-7--frontend-student-experience)
12. [Phase 8 — QA, Hardening & Deployment](#12-phase-8--qa-hardening--deployment)
13. [Upgrade Task Checklist (v1.0 → v2.0)](#13-upgrade-task-checklist)
14. [Dependency Map](#14-dependency-map)
15. [Risk Register](#15-risk-register)
16. [Definition of Done](#16-definition-of-done)

---

## 1. Implementation Philosophy

The following rules govern the entire build process and must not be violated regardless of timeline pressure.

### Build Order Rule
```
System Architecture → Database Schema → Backend APIs → Authentication
→ Payment Integration → Video Storage → Frontend
```
UI work must never begin before the API contract for that feature is stable. Frontend components built against undefined APIs require expensive rework.

### Core Engineering Rules

| Rule | Rationale |
|---|---|
| Never trust frontend payment success for enrollment | Payment bypass vulnerability |
| Never route video uploads through the application server | Server memory exhaustion |
| Never store videos on local disk or application server | Cloudflare Stream required for scale |
| Always validate completion server-side before issuing a certificate | Certificate integrity |
| All heavy operations (PDF, email) must run in BullMQ workers | API thread blocking |
| Never skip Razorpay webhook HMAC signature verification | Payment fraud vector |
| Stripe must not appear anywhere in the codebase | v2.0 constraint — Razorpay only |
| All database changes via Prisma migrations only | Schema drift prevention |
| All secrets via environment variables only | Security baseline |

### Development Sequence Per Feature
For every new feature, the sequence is:
1. Define Prisma schema changes
2. Write and run migration
3. Build NestJS service layer
4. Build NestJS controller with DTOs
5. Write guard/middleware if required
6. Test API with HTTP client (Bruno)
7. Build frontend data hooks (React Query)
8. Build UI components
9. Integration test end-to-end

---

## 2. Prerequisites & Environment Setup

### Local Development Stack

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Backend and frontend runtime |
| Podman | Latest | Local container runtime |
| PostgreSQL | 15+ | Primary database |
| Redis | 7+ | BullMQ queues and rate limiting |
| Prisma CLI | Latest | Database migrations |
| NestJS CLI | Latest | Backend scaffolding |

### External Service Accounts Required Before Development

| Service | Purpose | Notes |
|---|---|---|
| **Cloudflare Stream** | Video hosting, HLS delivery, adaptive streaming | Account ID + API token required. **Replaces Bunny Stream.** |
| Cloudflare R2 | File storage (thumbnails, PDFs, resources, certificates) | Bucket and access keys required |
| Zoom Developer | Live class meeting creation | OAuth app registration required |
| Razorpay | INR payments (**only payment gateway**) | Test and live API keys |
| Resend | Transactional email | Domain verification required |
| Railway | Hosting (backend, database, Redis) | Project setup required |
| Vercel | Frontend hosting | Connect GitHub repo |

> **Bunny Stream account is no longer required.**  
> **Stripe account is not used — do not create or configure one.**

### Environment Variables (v2.0 Baseline)

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lms_db

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudflare Stream
CF_STREAM_ACCOUNT_ID=
CF_STREAM_API_TOKEN=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Zoom
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# Razorpay (only payment gateway)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# Redis
REDIS_URL=redis://localhost:6379
```

> **Removed from v1.0:** `BUNNY_API_KEY`, `BUNNY_LIBRARY_ID`, `BUNNY_CDN_HOSTNAME`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

---

## 3. Phase Overview

| Phase | Focus Area | Key Deliverable |
|---|---|---|
| Phase 0 | Scaffolding | Monorepo setup, configs, CI baseline |
| Phase 1 | Auth & Infrastructure | Working auth system, DB connected |
| Phase 2 | Course, Video & Recordings | Admin can create courses, upload videos, upload Zoom recordings |
| Phase 3 | Enrollment & Payments | Students can enroll; Razorpay payments webhook-verified |
| Phase 4 | Learning, Quizzes, Certs | Full learning loop with certificate |
| Phase 5 | Live Classes & Notifications | Zoom integration; email + in-app alerts |
| Phase 6 | Admin Dashboard | Analytics, student management, admin UI |
| Phase 7 | Student Frontend | Complete student-facing UI |
| Phase 8 | QA, Hardening, Deploy | Production deployment on Railway + Vercel |

> **Estimated total build for Phase 1 platform (small team):** 10–14 weeks depending on team size.

---

## 4. Phase 0 — Project Scaffolding

**Goal:** Repository structure, tooling, and base configuration in place before any feature work begins.

### 4.1 Repository Setup

- [ ] Initialise monorepo structure (or separate repos for frontend/backend)
- [ ] Set up `.gitignore` for Node, Next.js, environment files
- [ ] Establish branch strategy: `main` (production), `develop` (integration), `feature/*`
- [ ] Configure commit linting (conventional commits recommended)
- [ ] Add `.nvmrc` pinned to `20`

### 4.2 Backend Scaffold (NestJS)

```bash
npm install -g @nestjs/cli
nest new lms-backend
```

- [ ] Configure `src/` directory structure matching the module architecture
- [ ] Install and configure Prisma
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
- [ ] Configure PostgreSQL connection in `prisma/schema.prisma`
- [ ] Install core dependencies:
  ```bash
  npm install @nestjs/jwt @nestjs/passport passport passport-jwt
  npm install @nestjs/throttler
  npm install bcrypt
  npm install bullmq ioredis @nestjs/bullmq
  npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner  # For R2
  npm install nodemailer resend
  npm install class-validator class-transformer
  npm install razorpay
  npm install helmet
  npm install puppeteer
  npm install qrcode
  ```
- [ ] **Do NOT install `stripe`** — excluded in v2.0
- [ ] Set up `ConfigModule` with `.env` loading
- [ ] Set up global validation pipe
- [ ] Set up global exception filter
- [ ] Configure CORS for frontend origin (Vercel URL)

### 4.3 Frontend Scaffold (Next.js)

```bash
npx create-next-app@latest lms-frontend --typescript --tailwind --app --src-dir
```

- [ ] Install ShadCN UI
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] Install Zustand and React Query
  ```bash
  npm install zustand @tanstack/react-query
  npm install axios
  ```
- [ ] Set up `lib/api-client.ts` (Axios instance with interceptors)
- [ ] Set up `providers/` directory (QueryClientProvider, auth context)
- [ ] Configure `middleware.ts` placeholder (use `jose` for Edge-compatible JWT validation)
- [ ] Set up route group folder structure:
  - `app/(public)/`
  - `app/(auth)/`
  - `app/(student)/`
  - `app/admin/`
- [ ] Configure Tailwind theme tokens (colors, fonts, spacing)
- [ ] Install Inter font via `next/font`
- [ ] **Do NOT install `stripe` JS SDK** — excluded in v2.0

### 4.4 Database Init

- [ ] Write base Prisma schema for all tables (see DATABASE_SCHEMA.md v2.0)
  - Includes `lessons.type` enum: `video | recording | resource`
- [ ] Run initial migration:
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] Generate Prisma client
- [ ] Write database seed script for admin user

### 4.5 Docker / Podman Local Setup

- [ ] Write `podman-compose.yml` for:
  - PostgreSQL 15
  - Redis 7
  ```yaml
  services:
    postgres:
      image: postgres:15
      environment:
        POSTGRES_DB: lms_db
        POSTGRES_USER: lms_user
        POSTGRES_PASSWORD: lms_password
      ports:
        - "5432:5432"
    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
  ```
- [ ] Confirm local stack starts cleanly

---

## 5. Phase 1 — Authentication & Core Infrastructure

**Goal:** A working, secure authentication system. Users can register, verify email, log in, and receive role-appropriate JWT tokens.

**Backend Dependencies:** Prisma schema (users table), Redis (rate limiting), Email provider (Resend)

### 5.1 Database

- [ ] Confirm `users` table schema in Prisma:
  - `id`, `name`, `email`, `password_hash`, `role`, `is_verified`, `created_at`, `updated_at`
- [ ] Add unique index on `users.email`
- [ ] Run migration

### 5.2 Auth Module (NestJS)

- [ ] Implement `POST /auth/register`
  - Validate DTO (name, email, password)
  - Check email uniqueness
  - Hash password with bcrypt (rounds: 12)
  - Create user with `is_verified = false`
  - Generate email verification token (UUID, 24h expiry)
  - Queue verification email via BullMQ
- [ ] Implement `GET /auth/verify/:token`
  - Validate token and expiry
  - Set `is_verified = true`
  - Invalidate token
- [ ] Implement `POST /auth/login`
  - Validate credentials
  - Check `is_verified`
  - Generate access token (15m) and refresh token (7d)
  - Store refresh token server-side (DB or Redis)
  - Return tokens as HTTP-only cookies
- [ ] Implement `POST /auth/refresh`
  - Validate refresh token
  - Rotate: issue new refresh token, invalidate old
  - Return new access token
- [ ] Implement `POST /auth/logout`
  - Invalidate refresh token server-side
- [ ] Implement `JwtStrategy` and `RefreshStrategy`
- [ ] Implement `JwtAuthGuard` and `RolesGuard`
- [ ] Apply rate limiting on `/auth/login` (5 req/min per IP) and `/auth/register` (3 req/min)

### 5.3 Users Module

- [ ] Implement `GET /users/me` (protected, returns current user profile)
- [ ] Implement `PATCH /users/me` (update name, avatar)

### 5.4 Notification Module (Email — Baseline)

- [ ] Set up Resend email service
- [ ] Implement React Email template: Account verification email
- [ ] Wire email dispatch into BullMQ `email-dispatch` queue worker

### 5.5 Frontend — Auth

- [ ] Build `/register` page (form: name, email, password)
- [ ] Build `/login` page (form: email, password)
- [ ] Build `/verify-email` page (token confirmation feedback)
- [ ] Implement `middleware.ts` (using `jose`):
  - Read access token from HTTP-only cookie
  - Verify JWT at Edge
  - Redirect unauthenticated users from protected routes to `/login`
  - Redirect authenticated students from `/admin/*` to `/dashboard`
- [ ] Implement Zustand `authStore` (user object, role, isAuthenticated)
- [ ] Implement React Query `useAuth` hook
- [ ] Implement token refresh interceptor in `api-client.ts`

### Phase 1 Completion Criteria
- [ ] User can register and receive verification email
- [ ] User cannot log in until email is verified
- [ ] Login returns valid JWT tokens in HTTP-only cookies
- [ ] Admin route returns 403 for student role
- [ ] Student route returns redirect for unauthenticated user
- [ ] Logout invalidates refresh token

---

## 6. Phase 2 — Course System & Video Pipeline

**Goal:** Admin can create a complete course with modules, lessons (including `recording` type), and uploaded videos via Cloudflare Stream. Courses can be published.

**Backend Dependencies:** Phase 1 complete, Cloudflare Stream account, Cloudflare R2 account

### 6.1 Database

- [ ] Add tables to Prisma schema: `courses`, `modules`, `lessons`
- [ ] `lessons.type` enum: `video | recording | resource` *(v2.0: adds `recording`)*
- [ ] `lessons.video_id` stores Cloudflare Stream `uid` string (not a URL)
- [ ] Indexes: `courses.status`, `modules.course_id`, `lessons.module_id`
- [ ] Run migration

### 6.2 Courses Module

- [ ] Implement `POST /courses` (admin only)
  - Validate DTO: title, description, price, isFree, thumbnailUrl
  - Create course with `status = draft`
- [ ] Implement `GET /courses` (public)
  - Filter by `status = published`
  - Support query: `?type=free|paid&search=keyword`
  - Paginate results
- [ ] Implement `GET /courses/:id` (public)
  - Return course + modules + lessons + quiz existence flag
- [ ] Implement `PATCH /courses/:id` (admin only)
- [ ] Implement `PATCH /courses/:id/publish` (admin only)
  - Validate: at least 1 module with 1 lesson with a video
  - Set status to `published`
- [ ] Implement `PATCH /courses/:id/archive` (admin only)

### 6.3 Modules Module

- [ ] Implement `POST /courses/:courseId/modules` (admin only)
- [ ] Implement `GET /courses/:courseId/modules`
- [ ] Implement `PATCH /modules/:id` (reorder, rename)
- [ ] Implement `DELETE /modules/:id` (admin only)

### 6.4 Lessons Module

- [ ] Implement `POST /modules/:moduleId/lessons` (admin only)
  - Lesson types: `video`, `recording`, or `resource`
  - Returns `lessonId` and upload endpoint (for `video` and `recording` types)
- [ ] Implement `PATCH /lessons/:id` (attach `videoId`, update metadata)
- [ ] Implement `DELETE /lessons/:id` (admin only)

### 6.5 Video & Recording Upload Pipeline (Cloudflare Stream)

> **v2.0 change:** Bunny Stream is fully replaced by Cloudflare Stream. The upload API and player component must both target Cloudflare.

- [ ] Implement `POST /videos/upload-url` (admin only)
  - Call Cloudflare Stream API: `POST /accounts/{accountId}/stream/direct_upload`
  - Return `{ uploadUrl, videoId }` (`videoId` = Cloudflare Stream `uid`)
- [ ] Frontend admin browser uploads file **directly to Cloudflare Stream** via `uploadUrl` (no backend bandwidth)
- [ ] After upload, frontend calls `PATCH /lessons/:id` with `{ videoId }`
- [ ] Implement `GET /videos/:videoId/status` (admin only)
  - Poll `GET /accounts/{accountId}/stream/{videoId}` for processing status
  - Return: `ready`, `processing`, `error`
- [ ] `video` and `recording` lesson types follow the **identical upload flow** — the distinction is semantic only

### 6.6 File Storage (Cloudflare R2)

- [ ] Set up R2 S3-compatible client in backend using `@aws-sdk/client-s3`
  ```typescript
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  ```
- [ ] Implement `POST /files/upload-url` (admin only)
  - Generate pre-signed R2 PUT URL for thumbnails and resources
  - Return `{ uploadUrl, publicUrl }`
- [ ] Admin uploads thumbnail and resource files directly to R2 from browser

### 6.7 Frontend — Admin Course Builder

- [ ] Build `/admin/courses` list page (table of all courses with status)
- [ ] Build `/admin/courses/create` multi-step form:
  - Step 1: Course details (title, description, price, free/paid, thumbnail upload)
  - Step 2: Add modules (drag-to-reorder list)
  - Step 3: Add lessons to modules (`video`, `recording`, or `resource` type)
  - Step 4: Video/Recording upload with progress bar and Cloudflare Stream processing status
  - Step 5: Publish confirmation
- [ ] Build `/admin/courses/:id` edit page
- [ ] Build **Recording Upload Panel** in admin:
  - Allows admin to upload Zoom recording file
  - Creates a `recording`-type lesson in the selected module
  - Uses the same `POST /videos/upload-url` flow as video lessons
- [ ] Build `CloudflareStreamPlayer` frontend component:
  - Embeds `https://iframe.cloudflarestream.com/{videoId}`
  - Used for both `video` and `recording` lesson types
- [ ] Implement admin course management React Query hooks:
  - `useCourses`, `useCreateCourse`, `usePublishCourse`
  - `useModules`, `useCreateModule`
  - `useLessons`, `useCreateLesson`
  - `useVideoUpload` (handles pre-signed URL + direct upload to Cloudflare + polling)

### Phase 2 Completion Criteria
- [ ] Admin can create, edit, and publish a course
- [ ] Admin can add ordered modules and lessons of all three types
- [ ] Admin can upload a video; video streams via Cloudflare Stream player
- [ ] Admin can upload a Zoom recording as a `recording` lesson
- [ ] `recording` lessons play identically to `video` lessons
- [ ] Thumbnail uploads to Cloudflare R2 and displays on course card
- [ ] Published courses appear in public course listing
- [ ] Draft courses are not visible to students

---

## 7. Phase 3 — Enrollment & Payment Integration

**Goal:** Students can enroll in free courses and pay for paid courses via Razorpay. Payment verification is webhook-based only. Stripe is not implemented.

**Backend Dependencies:** Phase 2 complete, Razorpay account, webhook endpoint accessible (use ngrok for local testing)

### 7.1 Database

- [ ] Add tables: `enrollments`, `payments`
- [ ] Indexes: `enrollments.student_id`, `enrollments.course_id`
- [ ] Unique index: `enrollments(student_id, course_id)` — prevents duplicate enrollments
- [ ] Unique index: `payments.transaction_id`
- [ ] Run migration

### 7.2 Enrollment Module

- [ ] Implement `POST /courses/:id/enroll` (student, free courses only)
  - Verify course is free
  - Check student is not already enrolled
  - Create enrollment record
  - Queue enrollment email notification
- [ ] Implement `GET /students/me/courses` (student)
  - Return enrolled courses with progress percentages
- [ ] Implement `GET /courses/:id/access` (student)
  - Verify enrollment before returning lesson content

### 7.3 Payments Module (Razorpay Only)

> **v2.0 change:** Stripe support is fully removed. Only Razorpay is implemented.

- [ ] Implement `POST /payments/create` (student)
  - Accept: `courseId` (gateway is always Razorpay — no gateway selection)
  - Create Razorpay order via SDK: `razorpay.orders.create({ amount, currency: 'INR' })`
  - Return `{ orderId, amount, currency, keyId }`
- [ ] Implement `POST /payments/webhook/razorpay`
  - **Verify HMAC-SHA256 signature** using `RAZORPAY_WEBHOOK_SECRET` before any DB write
  - On `payment.captured`: create payment record + create enrollment (Prisma `$transaction`)
  - Idempotency: check if `(student_id, course_id)` enrollment already exists before creating
  - Queue enrollment + payment confirmation notifications
- [ ] Implement `GET /payments/invoice/:paymentId` (student)
  - Return invoice PDF URL from R2
- [ ] Implement `POST /payments/:id/refund` (admin only)
  - Call Razorpay refund API
  - Update payment status to `refunded`
- [ ] Implement `GET /admin/payments` (admin only)
  - List all transactions with filters (status, date range)
- [ ] **Do NOT implement** `POST /payments/webhook/stripe` or any Stripe endpoint

### 7.4 Invoice Generation

- [ ] Build React Email invoice template
- [ ] Implement Puppeteer PDF generation for invoices (in BullMQ worker)
- [ ] Upload generated invoice PDF to Cloudflare R2 under `invoices/{paymentId}/`
- [ ] Store `invoice_url` in payment record

### 7.5 Frontend — Enrollment & Payment

- [ ] Build course detail page (public): `/courses/:id`
  - Course info, curriculum preview, enroll/buy button
- [ ] Build enrollment flow:
  - Free: confirm modal → call enroll API → redirect to course
  - Paid: initiate payment → open Razorpay.js checkout modal → redirect
- [ ] Build post-payment redirect handler:
  - Poll `GET /courses/:id/access` (every 3s, up to 30s)
  - Show pending / success / failure state
- [ ] Build student "My Courses" page: `/my-courses`
  - Enrolled courses with progress bars
- [ ] Implement React Query hooks:
  - `useEnroll`, `useCreatePayment`, `useEnrollmentStatus`

### Phase 3 Completion Criteria
- [ ] Student can enroll in a free course; enrollment created immediately
- [ ] Student can initiate Razorpay payment and complete checkout
- [ ] Enrollment is **only** created after webhook HMAC signature verified
- [ ] No Stripe code, packages, or references exist anywhere
- [ ] Student cannot access course content without enrollment record
- [ ] Invoice PDF generated and accessible after payment
- [ ] Admin can view all transactions and initiate refunds

---

## 8. Phase 4 — Learning Experience

**Goal:** Students can watch lessons (video and recording types), track progress, take quizzes, and receive certificates. Full learning loop is operational.

**Backend Dependencies:** Phase 3 complete, Puppeteer installed, R2 configured

### 8.1 Database

- [ ] Add tables: `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `lesson_progress`, `certificates`
- [ ] Indexes:
  - Unique: `lesson_progress(student_id, lesson_id)`
  - `quiz_attempts(student_id, quiz_id)`
  - Unique: `certificates.certificate_code`
- [ ] Run migration

### 8.2 Progress Module

- [ ] Implement `POST /progress/video`
  - Payload: `{ lessonId, watchedPercentage }`
  - Handles both `video` and `recording` lesson types identically
  - If `watchedPercentage >= 80` and lesson not already complete:
    - Mark lesson as complete in `lesson_progress`
    - Trigger completion check
- [ ] Implement `POST /progress/resource`
  - Mark resource lesson as complete on "Mark Complete" click
  - Trigger completion check
- [ ] Implement `GET /courses/:courseId/progress` (student)
  - Return: total lessons, completed lessons, percentage, per-module breakdown
- [ ] Implement course completion check service:
  - Count all lessons in course
  - Count completed lessons for student
  - Count all quizzes in course
  - Count passed quizzes for student
  - If all conditions met: enqueue `certificate-generation` BullMQ job

### 8.3 Quiz Module

- [ ] Implement `POST /lessons/:lessonId/quiz` (admin only)
  - Create quiz with title and passing score
- [ ] Implement `POST /quiz/:quizId/questions` (admin only)
  - Create question (MCQ or `short_answer`)
  - For MCQ: create options (with `is_correct` flag)
- [ ] Implement `GET /lessons/:lessonId/quiz` (student)
  - Return quiz questions (MCQ options shuffled, without `is_correct`)
  - Return attempt count for the student
- [ ] Implement `POST /quiz/:quizId/attempt` (student)
  - Validate: attempt count < 3 (enforced server-side)
  - Score MCQ answers against correct options
  - Record short-answer submissions as submitted (manual grading by admin)
  - Calculate total score
  - Create `quiz_attempts` record
  - Return: `{ score, passed, attemptsRemaining }`
  - If passed and quiz blocks lesson completion: trigger completion check

### 8.4 Certificate Module

- [ ] Implement `POST /certificates/generate` (internal — triggered by BullMQ job)
  - Validate all lessons complete + all quizzes passed
  - Generate unique certificate code: `CDS-{COURSEID[:8]}-{USERID[:8]}-{YEAR}`
  - Queue `certificate-generation` BullMQ job
- [ ] BullMQ `CertificateWorker`:
  - Render React certificate template to HTML
  - Launch Puppeteer (`--no-sandbox --disable-setuid-sandbox` for Railway)
  - Render HTML to PDF
  - Generate QR code linking to `/verify/{code}` using `qrcode` npm package
  - Upload PDF to Cloudflare R2 under `certificates/{certificateCode}/`
  - Update certificate record with `pdf_url`
  - Enqueue certificate issued notification
- [ ] Implement `GET /certificates` (student)
  - List earned certificates with course name and download URL
- [ ] Implement `GET /certificates/verify/:code` (public, no auth)
  - Return: student name, course name, issue date, certificate code
  - Return 404 if code not found
- [ ] Implement `POST /admin/certificates/issue` (admin only)
  - Manually trigger certificate for a student + course

### 8.5 Frontend — Lesson Player

- [ ] Build lesson page: `/course/:courseId/lesson/:lessonId`
  - Layout: `LessonSidebar` | `LessonContent` | (optional `QuizPanel`)
- [ ] Build `LessonSidebar`:
  - Module accordion list
  - Lesson items with completion checkmarks
  - Type badge: `Video`, `Recording`, `Resource`
  - Currently active lesson highlighted
- [ ] Build `CloudflareStreamPlayer` component:
  - Embed `https://iframe.cloudflarestream.com/{videoId}`
  - Used for both `video` and `recording` lesson types
  - Track progress events
  - Call `POST /progress/video` when >= 80% reached (debounced, once per lesson)
- [ ] Build resource lesson view:
  - File download button
  - "Mark Complete" button (calls `POST /progress/resource`)
- [ ] Build `QuizContainer`:
  - Load quiz questions on demand
  - Render MCQ as radio buttons, short answer as textarea
  - Submit answers → display result (score, pass/fail, attempts remaining)
  - If attempts exhausted: show locked state

### 8.6 Frontend — Certificates

- [ ] Build `/certificates` student page
  - List of earned certificates (course name, issue date, download + verify links)
- [ ] Build `/verify/:certificateCode` public page
  - Fetch and display: student name, course name, issue date, certificate code
  - Show "Certificate Valid" / "Certificate Not Found" state

### Phase 4 Completion Criteria
- [ ] Video and recording progress tracked; lesson completes at 80% watch time
- [ ] Resource lessons complete on "Mark Complete" click
- [ ] Quiz enforces 3-attempt limit server-side
- [ ] Failed quiz blocks lesson completion
- [ ] Course completion triggers certificate generation via BullMQ
- [ ] Certificate PDF generated with QR code, uploaded to Cloudflare R2
- [ ] Public verification page returns valid certificate data
- [ ] Admin can manually issue a certificate

---

## 9. Phase 5 — Live Classes & Notifications

**Goal:** Admin can schedule Zoom classes. Students receive email and in-app notifications for all key events.

**Backend Dependencies:** Phase 4 complete, Zoom OAuth app configured, Resend configured

### 9.1 Database

- [ ] Add tables: `live_classes`, `notifications`
- [ ] Run migration

### 9.2 Live Classes Module

- [ ] Implement `POST /live-classes` (admin only)
  - Payload: `courseId`, `title`, `scheduledAt`, `durationMinutes`
  - Call Zoom API (`POST /users/me/meetings`) to create meeting
  - Store: `zoom_meeting_id`, `zoom_join_url`
  - Enqueue notification to all enrolled students
- [ ] Implement `GET /courses/:courseId/live-classes` (student)
  - Return upcoming and past sessions
- [ ] Implement `GET /admin/live-classes` (admin only)
  - All sessions with enrollment counts
- [ ] Implement `PATCH /live-classes/:id/recording` (admin only)
  - Store `recording_upload_note` or link to the `recording` lesson created for this session

### 9.3 Zoom Service

- [ ] Implement Zoom server-to-server OAuth token generation
- [ ] Implement meeting creation: `POST /users/me/meetings`
- [ ] Handle Zoom API failure gracefully (return error to admin with retry option)

### 9.4 Notifications Module

- [ ] Implement notification service:
  - `createNotification(userId, title, message)` — saves to DB
  - `sendEmail(to, subject, template, data)` — dispatches via Resend
- [ ] Implement BullMQ `notifications` queue:
  - Process: create DB record + enqueue email
- [ ] Implement `GET /notifications` (student)
  - Return unread and recent notifications (paginated)
- [ ] Implement `PATCH /notifications/read` (student) — mark all as read
- [ ] Implement `PATCH /notifications/:id/read` (student) — mark single as read

### 9.5 Email Templates (React Email)

Build all templates as React Email components:
- [ ] Account verification
- [ ] Course enrollment confirmation
- [ ] Payment confirmation (with invoice link)
- [ ] Live class scheduled (with Zoom join link and scheduled time)
- [ ] Certificate issued (with download link)

### 9.6 Frontend — Live Classes & Notifications

- [ ] Build `/live-classes` student page
  - Upcoming sessions: title, course name, date/time, join button (opens Zoom URL)
  - Past sessions section (with link to `recording` lesson if admin uploaded it)
- [ ] Build notification bell component (navbar):
  - Unread count badge
  - Dropdown showing recent 5 notifications
  - "Mark all read" action
- [ ] Build full notification center page `/notifications`
- [ ] Implement notification polling (every 30s)

### Phase 5 Completion Criteria
- [ ] Admin schedules live class; Zoom meeting auto-created
- [ ] All enrolled students receive email + in-app notification
- [ ] Student can join via Zoom link from dashboard
- [ ] All 5 email notification types send correctly
- [ ] Notification center shows unread count
- [ ] Notifications can be marked as read

---

## 10. Phase 6 — Admin Dashboard & Analytics

**Goal:** Admin has a complete management interface for students, courses, payments, and certificates.

**Backend Dependencies:** Phase 5 complete

### 10.1 Admin Analytics Endpoints

- [ ] Implement `GET /admin/dashboard/stats`
  - Total students registered
  - Total enrollments (paid vs free breakdown)
  - Total courses published
  - Total certificates issued
  - Total revenue (sum of successful Razorpay payments in INR)
- [ ] Implement `GET /admin/students`
  - Student list with: name, email, enrolled course count, completion count
  - Filterable by enrollment count, date joined
- [ ] Implement `GET /admin/students/:id`
  - Individual student: enrolled courses, progress per course, quiz attempts, certificates

### 10.2 Frontend — Admin Dashboard

- [ ] Build `/admin/dashboard` overview page
  - Stat cards: total students, enrollments, revenue (INR), certificates issued
  - Recent enrollments list
  - Upcoming live classes list
- [ ] Build `/admin/students` page
  - Paginated student table
  - Per-row: name, email, courses enrolled, courses completed
  - Click through to individual student detail
- [ ] Build `/admin/students/:id` detail page
  - Enrolled courses with per-course progress
  - Certificate list with issue/revoke action
- [ ] Build `/admin/live-classes` page
  - Schedule new class form
  - List of upcoming and past sessions
  - Recording upload link per past session (links to course module lesson creation)
- [ ] Build `/admin/payments` page
  - Transaction table (filter by status, date)
  - Per-transaction: refund button
  - All amounts in INR (₹)
- [ ] Build `/admin/certificates` page
  - Certificate list (student name, course, code, issue date)
  - Manual issue form

### Phase 6 Completion Criteria
- [ ] Admin dashboard shows accurate platform stats (INR revenue)
- [ ] Admin can view individual student progress
- [ ] Admin can manage live classes from dashboard
- [ ] Admin can view all Razorpay transactions and issue refunds
- [ ] Admin can view and manually issue certificates

---

## 11. Phase 7 — Frontend Student Experience

**Goal:** Polish the complete student-facing UI to match the design system. All empty and error states implemented.

### 11.1 Design System Implementation

- [ ] Confirm Tailwind theme config matches agreed palette:
  - Primary: `#2563EB`, Background: `#F8FAFC`, Surface: `#FFFFFF`
  - Text primary: `#0F172A`, Text secondary: `#475569`
- [ ] Install and configure Inter font via `next/font`
- [ ] Build shared component library:
  - `Button`, `Badge`, `Card`, `Modal`, `Toast`, `Skeleton`, `ProgressBar`
  - `CourseCard`, `LessonItem`, `ModuleAccordion`
  - `CloudflareStreamPlayer` (unified player for `video` and `recording` lessons)
  - `NotificationBadge`, `CertificateCard`

### 11.2 Public Pages

- [ ] Build home/landing page (`/`)
  - Hero section
  - Featured courses grid
  - Platform stats section
  - Footer (About, Contact, Privacy Policy, Terms, Help Center, © Codedevin Solutions)
- [ ] Build public course listing (`/courses`)
  - Course cards with thumbnail, title, price, free/paid badge
  - Search input + free/paid filter
  - Pagination
- [ ] Build public course detail (`/courses/:id`)
  - Thumbnail, title, description, price, curriculum (locked module/lesson list)
  - Lesson type icons: 🎥 Video, 📹 Recording, 📄 Resource
  - Enroll / Buy button
  - Instructor info (admin)

### 11.3 Student Dashboard

- [ ] Build student dashboard (`/dashboard`)
  - Active courses with progress bars
  - Upcoming live classes widget
  - Recent notifications widget
  - Certificates earned widget
- [ ] Build "My Courses" page (`/my-courses`)
  - Enrolled courses grid with progress
  - Continue Learning button per course

### 11.4 Empty & Error States

Implement for all screens:

| Screen | Empty State | Error State |
|---|---|---|
| My Courses | "No courses enrolled yet. Browse courses." + Browse button | "Failed to load courses. Retry." |
| Certificates | "Complete a course to earn your first certificate." + View Courses button | — |
| Live Classes | "No live classes scheduled yet. Check back soon." | — |
| Notifications | "You're all caught up. No new notifications." | — |
| Admin: No Courses | "No courses created yet." + Create Course button | — |
| Admin: No Students | "No students registered yet." | — |
| Quiz Locked | "You have used all 3 attempts for this quiz." | — |
| Video Not Ready | "This video is still processing. Check back in a few minutes." | — |
| Payment Pending | "Your payment is being confirmed. This may take a moment." | — |
| Course Locked | "Enroll in this course to access lessons." | — |

### 11.5 Responsive Implementation

- [ ] Test all pages at: 1280px (desktop), 1024px (laptop), 768px (tablet), 375px (mobile)
- [ ] Implement sidebar drawer behavior for tablet/mobile (student + admin)
- [ ] Ensure Cloudflare Stream player is responsive (16:9 aspect ratio maintained)
- [ ] Ensure quiz interface is usable on mobile

### Phase 7 Completion Criteria
- [ ] All design tokens applied consistently
- [ ] All empty and error states implemented
- [ ] All pages responsive at the three specified breakpoints
- [ ] Navigation collapses to drawer on mobile/tablet
- [ ] Public landing page live

---

## 12. Phase 8 — QA, Hardening & Deployment

**Goal:** Production-ready platform deployed to Railway (backend) and Vercel (frontend) with security hardened and load tested.

### 12.1 Security Hardening

- [ ] Confirm rate limiting active on: login, registration, payment initiation, quiz submission
- [ ] Add `helmet` middleware to NestJS (HTTP security headers)
- [ ] Confirm all admin endpoints have `RolesGuard` applied
- [ ] Confirm Razorpay webhook endpoint verifies HMAC signature before any DB write
- [ ] Confirm JWTs are HTTP-only, Secure, SameSite=Strict cookies
- [ ] Audit all API endpoints for missing auth guards
- [ ] Confirm Prisma parameterised queries prevent SQL injection
- [ ] Add CSRF protection for cookie-based auth
- [ ] Confirm R2 buckets are not publicly listable (only specific prefixes exposed)
- [ ] Verify no Stripe code, env vars, or references remain anywhere

### 12.2 Performance

- [ ] Add database indexes for all high-traffic queries (confirm from DATABASE_SCHEMA.md v2.0)
- [ ] Enable Next.js static generation for public course pages
- [ ] Add `React.lazy` / `Suspense` for lesson player (heavy component)
- [ ] Paginate all list endpoints (default: 20 items per page)
- [ ] Confirm BullMQ workers run in separate process
- [ ] Add Redis caching for course listing endpoint (60s TTL)

### 12.3 Testing

- [ ] Unit tests for critical services:
  - `AuthService` (token generation, validation)
  - `PaymentsService` (Razorpay webhook HMAC verification logic)
  - `CertificateService` (completion check logic)
  - `QuizService` (scoring, attempt limit)
- [ ] Integration tests:
  - Full enrollment flow (free and paid via Razorpay)
  - Full certificate generation flow
  - Auth flow (register → verify → login → refresh → logout)
  - Recording upload flow (upload → lesson creation → student playback)
- [ ] Manual QA checklist for all user flows

### 12.4 Railway + Vercel Deployment

- [ ] Create Railway project
- [ ] Add Railway PostgreSQL plugin
- [ ] Add Railway Redis plugin
- [ ] Configure all v2.0 environment variables in Railway dashboard (no Bunny, no Stripe vars)
- [ ] Connect backend GitHub repo to Railway (Nixpacks auto-detect Node)
- [ ] Configure `Procfile` or `nixpacks.toml`:
  ```
  web: node dist/main.js
  worker: node dist/workers/index.js
  ```
- [ ] Set Puppeteer flags for Railway container environment (`--no-sandbox`)
- [ ] Run `prisma migrate deploy` as Railway deploy command
- [ ] Deploy frontend to Vercel:
  - Set `NEXT_PUBLIC_API_URL` environment variable pointing to Railway backend
- [ ] Configure custom domain
- [ ] Confirm HTTPS on all endpoints
- [ ] Set up Zoom webhook URL in Zoom app settings (pointing to production)
- [ ] Set up Razorpay webhook URL pointing to production

### 12.5 Monitoring

- [ ] Set up Railway health check endpoint: `GET /health`
  - Returns: `{ "status": "ok", "database": "connected", "redis": "connected" }`
- [ ] Monitor BullMQ failed jobs (BullBoard optional)
- [ ] Configure Railway deploy notifications
- [ ] Set up basic uptime monitoring (UptimeRobot or similar)

### Phase 8 Completion Criteria
- [ ] All security hardening checks passed
- [ ] No Stripe references exist in the deployed codebase or environment
- [ ] Critical path unit and integration tests passing
- [ ] Platform deployed and accessible on custom domain
- [ ] Razorpay and Zoom webhooks pointing to production URLs
- [ ] Health endpoint responds 200
- [ ] End-to-end smoke test: register → enroll → learn (video + recording) → certificate → verify

---

## 13. Upgrade Task Checklist

This section tracks v1.0 → v2.0 migration tasks. Items are grouped by priority.

### Minimal (Breaking — Must Complete Before Any v2.0 Code Is Written)

- [ ] Remove `stripe` npm package from backend
- [ ] Remove `stripe` npm package from frontend (if installed)
- [ ] Delete all Stripe-related service code, controllers, and DTOs
- [ ] Replace `BUNNY_API_KEY`, `BUNNY_LIBRARY_ID`, `BUNNY_CDN_HOSTNAME` env vars with `CF_STREAM_ACCOUNT_ID`, `CF_STREAM_API_TOKEN`
- [ ] Update Prisma `lessons` schema: add `recording` to the lesson type enum
- [ ] Run and commit Prisma migration for the lesson type change
- [ ] Rewrite `POST /videos/upload-url` service to call Cloudflare Stream API
- [ ] Replace Bunny Stream player component with `CloudflareStreamPlayer` (`iframe.cloudflarestream.com/{videoId}`)
- [ ] Update `.env.example` to reflect v2.0 variable set

### Recommended (Core v2.0 Feature Work)

- [ ] Build recording upload admin UI panel
- [ ] Build `PATCH /live-classes/:id/recording` endpoint
- [ ] Add lesson type icons/labels to course curriculum views
- [ ] Update all admin API documentation to remove Stripe references
- [ ] Add Cloudflare Stream status polling to video upload UI

### Optional (Polish & Enhancement)

- [ ] Add `recording` badge/icon to lesson sidebar in lesson player
- [ ] Add filter for recording lessons in admin course builder
- [ ] Admin analytics: show breakdown of lesson types per course

---

## 14. Dependency Map

```
Phase 0 (Scaffold)
    └─▶ Phase 1 (Auth)
            └─▶ Phase 2 (Course + Video + Recording)
                    └─▶ Phase 3 (Enrollment + Razorpay Payment)
                                └─▶ Phase 4 (Learning + Quiz + Certificate)
                                            └─▶ Phase 5 (Live Classes + Notifications)
                                                        └─▶ Phase 6 (Admin Dashboard)
                                                                    └─▶ Phase 7 (Student UI Polish)
                                                                                └─▶ Phase 8 (QA + Deploy)
```

**No phase may begin before its predecessor's completion criteria are met.**

---

## 15. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cloudflare Stream API changes or downtime | Low | High | Document API version used; implement error fallback in player; pin SDK |
| Cloudflare Stream processing delay for large recordings | Medium | Medium | Show "Video processing" state in UI; allow admin to recheck status |
| Zoom OAuth token expiry mid-schedule | Medium | Medium | Implement auto-refresh of server-to-server OAuth token |
| Razorpay webhook delivery failure | Medium | High | Implement idempotency on webhook handler; manually reconcile via admin dashboard |
| Certificate Puppeteer fails in Railway container | Medium | High | Add `--no-sandbox` flag; test in Railway environment early; retry via BullMQ |
| Redis unavailability breaks BullMQ | Low | High | Railway managed Redis has high uptime; configure BullMQ in-memory fallback |
| Frontend builds break after Next.js updates | Low | Medium | Pin Next.js version in `package.json`; use `^` prefix to control minor updates |
| R2 pre-signed URL expiry during large uploads | Medium | Low | Set URL expiry to 2 hours; show re-upload error to admin |
| Database migration failure on production | Low | Critical | Always run migrations in staging first; keep migration rollback plan |
| Admin accidentally tries to add Stripe | Low | Medium | `.env.example` has no Stripe vars; Stripe package absent from `package.json` |

---

## 16. Definition of Done

A feature is considered **done** only when all of the following are true:

- [ ] Backend API endpoint implemented and tested via HTTP client (Bruno)
- [ ] Prisma schema changes migrated and Prisma client regenerated
- [ ] Input validated via NestJS DTOs using `class-validator`
- [ ] Auth guard applied where required (`JwtAuthGuard`, `RolesGuard`)
- [ ] Frontend component built and connected to API via React Query
- [ ] Empty state and error state implemented for the UI
- [ ] Feature works on desktop (1280px), tablet (768px), and mobile (375px)
- [ ] No hardcoded secrets or API keys in source code
- [ ] Environment variable documented in `.env.example`
- [ ] No Stripe references introduced
- [ ] Code reviewed and merged to `develop` branch

---

*End of Implementation Plan v2.0*
