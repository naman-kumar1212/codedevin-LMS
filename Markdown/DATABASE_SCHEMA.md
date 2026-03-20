
# Database Schema Document

## Code Devin Solutions — Learning Management System (LMS)

**Version:** 2.0
**Status:** Phase 1 — Production Schema
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

---

## Table of Contents

1. [Database Overview](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#1-database-overview)
2. [Design Principles](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#2-design-principles)
3. [Entity Relationship Diagram](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#3-entity-relationship-diagram)
4. [Table Specifications](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#4-table-specifications)
5. [Index Strategy](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#5-index-strategy)
6. [Enum Definitions](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#6-enum-definitions)
7. [Relationship Map](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#7-relationship-map)
8. [Complete Prisma Schema](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#8-complete-prisma-schema)
9. [Migration Strategy](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#9-migration-strategy)
10. [Query Patterns Reference](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#10-query-patterns-reference)

---

## 1. Database Overview

| Attribute              | Value                             |
| ---------------------- | --------------------------------- |
| Database Engine        | PostgreSQL 15+                    |
| ORM                    | Prisma 5+                         |
| Hosting                | Railway managed PostgreSQL plugin |
| Primary Key Type       | UUID                              |
| Total Tables (Phase 1) | 14                                |

### Table Summary

| Table               | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `users`           | All platform users (admin + students)      |
| `courses`         | Course catalogue                           |
| `modules`         | Course modules                             |
| `lessons`         | Lessons (video, recording, resource types) |
| `enrollments`     | Student-course associations                |
| `lesson_progress` | Per-student lesson completion              |
| `quizzes`         | Quiz definitions per lesson                |
| `quiz_questions`  | Individual quiz questions                  |
| `quiz_options`    | MCQ answer options                         |
| `quiz_attempts`   | Student quiz submissions                   |
| `payments`        | Razorpay payment records                   |
| `certificates`    | Issued certificates                        |
| `live_classes`    | Scheduled Zoom sessions                    |
| `notifications`   | In-platform notification records           |

---

## 2. Design Principles

* **UUIDs as primary keys** — Prevents enumeration attacks; supports future partitioning
* **Soft state via status columns** — Courses use `status` enum; no hard deletes on business data
* **No cascade deletes on business data** — Payments, enrollments, certificates are never deleted
* **Video ID storage, not URLs** — `lessons.video_id` stores the Cloudflare Stream video UID only. CDN hostname is a config value. Decouples schema from provider.
* **Three lesson types** — `video`, `recording`, `resource`. Recording lessons use the same Cloudflare Stream infrastructure as video lessons. The type is semantic, not structural.
* **Razorpay only** — `payments` table has no `gateway` enum — only Razorpay. No Stripe fields.
* **Nullable FK for free enrollments** — `enrollments.payment_id` is nullable (free courses have no payment)

---

## 3. Entity Relationship Diagram

```
users
  │
  ├──────────────────────────────────────────────────────────┐
  │ (admin: created_by)              (student: student_id)   │
  ▼                                                          ▼
courses ──────────────────────────────────────── enrollments
  │                                                          │
  ├──▶ modules                                   (payment_id, nullable)
  │       │                                                  │
  │       └──▶ lessons ──────────────────── lesson_progress
  │               │                            (student_id)
  │               └──▶ quizzes
  │                       │
  │                       ├──▶ quiz_questions
  │                       │         └──▶ quiz_options
  │                       └──▶ quiz_attempts (student_id)
  │
  ├──▶ live_classes
  │
  └──▶ certificates (student_id, course_id)

users ──▶ payments (student_id)
      ──▶ certificates (student_id)
      ──▶ notifications (user_id)
      ──▶ quiz_attempts (student_id)
      ──▶ lesson_progress (student_id)
```

---

## 4. Table Specifications

### 4.1 users

| Column                        | Type             | Constraints                   | Description                         |
| ----------------------------- | ---------------- | ----------------------------- | ----------------------------------- |
| `id`                        | `UUID`         | PK                            | Unique user identifier              |
| `name`                      | `VARCHAR(100)` | NOT NULL                      | Display name                        |
| `email`                     | `VARCHAR(255)` | NOT NULL, UNIQUE              | Login email                         |
| `password_hash`             | `VARCHAR(255)` | NOT NULL                      | bcrypt hash                         |
| `role`                      | `UserRole`enum | NOT NULL, default:`student` | admin or student                    |
| `is_verified`               | `BOOLEAN`      | NOT NULL, default:`false`   | Email verified                      |
| `verification_token`        | `VARCHAR(255)` | NULLABLE                      | UUID email verification token       |
| `verification_token_expiry` | `TIMESTAMPTZ`  | NULLABLE                      | 24-hour expiry                      |
| `refresh_token_hash`        | `VARCHAR(255)` | NULLABLE                      | bcrypt hash of active refresh token |
| `created_at`                | `TIMESTAMPTZ`  | NOT NULL, default:`now()`   |                                     |
| `updated_at`                | `TIMESTAMPTZ`  | NOT NULL, auto-update         |                                     |

---

### 4.2 courses

| Column            | Type                 | Constraints                 | Description              |
| ----------------- | -------------------- | --------------------------- | ------------------------ |
| `id`            | `UUID`             | PK                          |                          |
| `title`         | `VARCHAR(200)`     | NOT NULL                    |                          |
| `description`   | `TEXT`             | NOT NULL                    |                          |
| `thumbnail_url` | `VARCHAR(500)`     | NULLABLE                    | Cloudflare R2 public URL |
| `price`         | `INTEGER`          | NOT NULL, default:`0`     | INR paise (0 = free)     |
| `is_free`       | `BOOLEAN`          | NOT NULL, default:`false` |                          |
| `status`        | `CourseStatus`enum | NOT NULL, default:`draft` |                          |
| `created_by`    | `UUID`             | NOT NULL, FK →`users.id` | Admin creator            |
| `created_at`    | `TIMESTAMPTZ`      | NOT NULL                    |                          |
| `updated_at`    | `TIMESTAMPTZ`      | NOT NULL                    |                          |

---

### 4.3 modules

| Column          | Type             | Constraints                   | Description                 |
| --------------- | ---------------- | ----------------------------- | --------------------------- |
| `id`          | `UUID`         | PK                            |                             |
| `course_id`   | `UUID`         | NOT NULL, FK →`courses.id` |                             |
| `title`       | `VARCHAR(200)` | NOT NULL                      |                             |
| `description` | `TEXT`         | NULLABLE                      |                             |
| `order_index` | `INTEGER`      | NOT NULL                      | Display order within course |
| `created_at`  | `TIMESTAMPTZ`  | NOT NULL                      |                             |

---

### 4.4 lessons

Supports three types: `video`, `recording`, and `resource`.

`video` and `recording` both store a Cloudflare Stream `video_id`. Their playback, progress tracking, and access control are identical. The `type` column is semantic — it tells the UI whether to label the lesson as a regular video or a live session recording.

| Column               | Type               | Constraints                   | Description                                             |
| -------------------- | ------------------ | ----------------------------- | ------------------------------------------------------- |
| `id`               | `UUID`           | PK                            |                                                         |
| `module_id`        | `UUID`           | NOT NULL, FK →`modules.id` |                                                         |
| `title`            | `VARCHAR(200)`   | NOT NULL                      |                                                         |
| `type`             | `LessonType`enum | NOT NULL                      | `video`,`recording`, or `resource`                |
| `video_id`         | `VARCHAR(255)`   | NULLABLE                      | Cloudflare Stream video UID (video + recording lessons) |
| `resource_url`     | `VARCHAR(500)`   | NULLABLE                      | Cloudflare R2 file URL (resource lessons)               |
| `duration_seconds` | `INTEGER`        | NULLABLE                      | Video/recording duration                                |
| `order_index`      | `INTEGER`        | NOT NULL                      | Display order within module                             |
| `created_at`       | `TIMESTAMPTZ`    | NOT NULL                      |                                                         |

**Notes:**

* `video_id` is populated for `type = video` and `type = recording`
* `resource_url` is populated for `type = resource`
* Both are never populated simultaneously

---

### 4.5 enrollments

| Column          | Type            | Constraints                    | Description               |
| --------------- | --------------- | ------------------------------ | ------------------------- |
| `id`          | `UUID`        | PK                             |                           |
| `student_id`  | `UUID`        | NOT NULL, FK →`users.id`    |                           |
| `course_id`   | `UUID`        | NOT NULL, FK →`courses.id`  |                           |
| `payment_id`  | `UUID`        | NULLABLE, FK →`payments.id` | NULL for free enrollments |
| `enrolled_at` | `TIMESTAMPTZ` | NOT NULL                       |                           |

**Unique composite:** `(student_id, course_id)` — prevents duplicate enrollments.

---

### 4.6 lesson_progress

| Column           | Type            | Constraints                   | Description |
| ---------------- | --------------- | ----------------------------- | ----------- |
| `id`           | `UUID`        | PK                            |             |
| `student_id`   | `UUID`        | NOT NULL, FK →`users.id`   |             |
| `lesson_id`    | `UUID`        | NOT NULL, FK →`lessons.id` |             |
| `is_completed` | `BOOLEAN`     | NOT NULL, default:`false`   |             |
| `completed_at` | `TIMESTAMPTZ` | NULLABLE                      |             |

**Unique composite:** `(student_id, lesson_id)` — enables upsert operations.

**Completion rules:**

* `video` lessons: `is_completed = true` when `watchedPercentage >= 80`
* `recording` lessons: same as video lessons
* `resource` lessons: `is_completed = true` when student clicks "Mark Complete"

---

### 4.7 quizzes

| Column            | Type             | Constraints                           | Description         |
| ----------------- | ---------------- | ------------------------------------- | ------------------- |
| `id`            | `UUID`         | PK                                    |                     |
| `lesson_id`     | `UUID`         | NOT NULL, UNIQUE, FK →`lessons.id` | One quiz per lesson |
| `title`         | `VARCHAR(200)` | NOT NULL                              |                     |
| `passing_score` | `INTEGER`      | NOT NULL                              | Percentage 0–100   |
| `created_at`    | `TIMESTAMPTZ`  | NOT NULL                              |                     |

---

### 4.8 quiz_questions

| Column            | Type                 | Constraints                   | Description                |
| ----------------- | -------------------- | ----------------------------- | -------------------------- |
| `id`            | `UUID`             | PK                            |                            |
| `quiz_id`       | `UUID`             | NOT NULL, FK →`quizzes.id` |                            |
| `question_text` | `TEXT`             | NOT NULL                      |                            |
| `question_type` | `QuestionType`enum | NOT NULL                      | `mcq`or `short_answer` |
| `order_index`   | `INTEGER`          | NOT NULL                      |                            |
| `created_at`    | `TIMESTAMPTZ`      | NOT NULL                      |                            |

---

### 4.9 quiz_options

| Column          | Type             | Constraints                          | Description |
| --------------- | ---------------- | ------------------------------------ | ----------- |
| `id`          | `UUID`         | PK                                   |             |
| `question_id` | `UUID`         | NOT NULL, FK →`quiz_questions.id` |             |
| `option_text` | `VARCHAR(500)` | NOT NULL                             |             |
| `is_correct`  | `BOOLEAN`      | NOT NULL, default:`false`          |             |
| `order_index` | `INTEGER`      | NOT NULL                             |             |

**Note:** `is_correct` never returned to students in API responses.

---

### 4.10 quiz_attempts

| Column           | Type            | Constraints                   | Description       |
| ---------------- | --------------- | ----------------------------- | ----------------- |
| `id`           | `UUID`        | PK                            |                   |
| `student_id`   | `UUID`        | NOT NULL, FK →`users.id`   |                   |
| `quiz_id`      | `UUID`        | NOT NULL, FK →`quizzes.id` |                   |
| `score`        | `INTEGER`     | NOT NULL                      | Percentage 0–100 |
| `is_passed`    | `BOOLEAN`     | NOT NULL                      |                   |
| `attempted_at` | `TIMESTAMPTZ` | NOT NULL                      |                   |

**Max 3 attempts per `(student_id, quiz_id)` — enforced by counting rows.**

---

### 4.11 payments

Razorpay only. No Stripe fields.

| Column                  | Type                  | Constraints                   | Description                   |
| ----------------------- | --------------------- | ----------------------------- | ----------------------------- |
| `id`                  | `UUID`              | PK                            |                               |
| `student_id`          | `UUID`              | NOT NULL, FK →`users.id`   |                               |
| `course_id`           | `UUID`              | NOT NULL, FK →`courses.id` |                               |
| `razorpay_order_id`   | `VARCHAR(255)`      | NOT NULL                      | Razorpay order ID             |
| `razorpay_payment_id` | `VARCHAR(255)`      | NOT NULL, UNIQUE              | Razorpay payment ID           |
| `amount`              | `INTEGER`           | NOT NULL                      | Amount in paise               |
| `currency`            | `VARCHAR(10)`       | NOT NULL, default:`INR`     |                               |
| `status`              | `PaymentStatus`enum | NOT NULL                      |                               |
| `invoice_url`         | `VARCHAR(500)`      | NULLABLE                      | Cloudflare R2 invoice PDF URL |
| `created_at`          | `TIMESTAMPTZ`       | NOT NULL                      |                               |
| `updated_at`          | `TIMESTAMPTZ`       | NOT NULL                      |                               |

**Idempotency:** `razorpay_payment_id` UNIQUE index prevents duplicate webhook processing.

---

### 4.12 certificates

| Column               | Type             | Constraints                   | Description                                |
| -------------------- | ---------------- | ----------------------------- | ------------------------------------------ |
| `id`               | `UUID`         | PK                            |                                            |
| `student_id`       | `UUID`         | NOT NULL, FK →`users.id`   |                                            |
| `course_id`        | `UUID`         | NOT NULL, FK →`courses.id` |                                            |
| `certificate_code` | `VARCHAR(100)` | NOT NULL, UNIQUE              | `CDS-{courseId[:8]}-{userId[:8]}-{YYYY}` |
| `pdf_url`          | `VARCHAR(500)` | NULLABLE                      | Cloudflare R2 PDF URL                      |
| `issued_at`        | `TIMESTAMPTZ`  | NOT NULL                      |                                            |

**Unique composite:** `(student_id, course_id)` — one certificate per student per course.

---

### 4.13 live_classes

| Column               | Type             | Constraints                   | Description                                |
| -------------------- | ---------------- | ----------------------------- | ------------------------------------------ |
| `id`               | `UUID`         | PK                            |                                            |
| `course_id`        | `UUID`         | NOT NULL, FK →`courses.id` |                                            |
| `title`            | `VARCHAR(200)` | NOT NULL                      |                                            |
| `zoom_meeting_id`  | `VARCHAR(50)`  | NOT NULL                      | Zoom meeting ID                            |
| `zoom_join_url`    | `VARCHAR(500)` | NOT NULL                      | Student join URL                           |
| `scheduled_at`     | `TIMESTAMPTZ`  | NOT NULL                      |                                            |
| `duration_minutes` | `INTEGER`      | NOT NULL                      |                                            |
| `recording_url`    | `VARCHAR(500)` | NULLABLE                      | Set after admin manually uploads recording |
| `created_at`       | `TIMESTAMPTZ`  | NOT NULL                      |                                            |

**Note:** `recording_url` is optional. When the admin uploads the recording to Cloudflare Stream and creates a `recording` lesson, this field can store the Cloudflare Stream video URL for reference, but the canonical recording access is through the lesson record.

---

### 4.14 notifications

| Column         | Type                     | Constraints                 | Description |
| -------------- | ------------------------ | --------------------------- | ----------- |
| `id`         | `UUID`                 | PK                          |             |
| `user_id`    | `UUID`                 | NOT NULL, FK →`users.id` |             |
| `type`       | `NotificationType`enum | NOT NULL                    |             |
| `title`      | `VARCHAR(255)`         | NOT NULL                    |             |
| `message`    | `TEXT`                 | NOT NULL                    |             |
| `is_read`    | `BOOLEAN`              | NOT NULL, default:`false` |             |
| `created_at` | `TIMESTAMPTZ`          | NOT NULL                    |             |

---

## 5. Index Strategy

```sql
-- users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- courses
CREATE INDEX idx_courses_status ON courses(status);

-- modules
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_course_order ON modules(course_id, order_index);

-- lessons
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_module_order ON lessons(module_id, order_index);
CREATE INDEX idx_lessons_type ON lessons(type);

-- enrollments
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE UNIQUE INDEX idx_enrollments_student_course
  ON enrollments(student_id, course_id);

-- lesson_progress
CREATE INDEX idx_lesson_progress_student_id ON lesson_progress(student_id);
CREATE UNIQUE INDEX idx_lesson_progress_student_lesson
  ON lesson_progress(student_id, lesson_id);

-- quizzes
CREATE UNIQUE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);

-- quiz_questions
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- quiz_options
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id);

-- quiz_attempts
CREATE INDEX idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);

-- payments
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE UNIQUE INDEX idx_payments_razorpay_payment_id
  ON payments(razorpay_payment_id);

-- certificates
CREATE UNIQUE INDEX idx_certificates_code ON certificates(certificate_code);
CREATE UNIQUE INDEX idx_certificates_student_course
  ON certificates(student_id, course_id);

-- live_classes
CREATE INDEX idx_live_classes_course_id ON live_classes(course_id);
CREATE INDEX idx_live_classes_scheduled_at ON live_classes(scheduled_at);

-- notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id) WHERE is_read = false;
```

---

## 6. Enum Definitions

### UserRole

```
admin    — Platform administrator
student  — Learner
```

### CourseStatus

```
draft      — Not visible to students
published  — Visible and enrollable
archived   — Hidden from new students; existing enrollments retained
```

### LessonType

```
video      — Regular video lesson (Cloudflare Stream)
recording  — Live session recording (Cloudflare Stream — identical infrastructure to video)
resource   — Downloadable file lesson (Cloudflare R2)
```

### QuestionType

```
mcq          — Multiple choice with selectable options
short_answer — Free-text response
```

### PaymentStatus

```
pending   — Payment initiated but webhook not yet received
completed — Payment confirmed via Razorpay webhook
failed    — Payment failed or expired
refunded  — Refunded by admin
```

### NotificationType

```
enrollment  — Student enrolled in a course
payment     — Payment confirmed
live_class  — Live class scheduled
certificate — Certificate issued
account     — Account-related (verification)
```

---

## 7. Relationship Map

| Parent             | Child               | Relationship          | FK              | On Delete |
| ------------------ | ------------------- | --------------------- | --------------- | --------- |
| `users`          | `courses`         | One-to-many           | `created_by`  | RESTRICT  |
| `users`          | `enrollments`     | One-to-many           | `student_id`  | RESTRICT  |
| `users`          | `payments`        | One-to-many           | `student_id`  | RESTRICT  |
| `users`          | `certificates`    | One-to-many           | `student_id`  | RESTRICT  |
| `users`          | `quiz_attempts`   | One-to-many           | `student_id`  | RESTRICT  |
| `users`          | `lesson_progress` | One-to-many           | `student_id`  | RESTRICT  |
| `users`          | `notifications`   | One-to-many           | `user_id`     | CASCADE   |
| `courses`        | `modules`         | One-to-many           | `course_id`   | RESTRICT  |
| `courses`        | `enrollments`     | One-to-many           | `course_id`   | RESTRICT  |
| `courses`        | `payments`        | One-to-many           | `course_id`   | RESTRICT  |
| `courses`        | `certificates`    | One-to-many           | `course_id`   | RESTRICT  |
| `courses`        | `live_classes`    | One-to-many           | `course_id`   | RESTRICT  |
| `modules`        | `lessons`         | One-to-many           | `module_id`   | RESTRICT  |
| `lessons`        | `quizzes`         | One-to-one            | `lesson_id`   | RESTRICT  |
| `quizzes`        | `quiz_questions`  | One-to-many           | `quiz_id`     | CASCADE   |
| `quiz_questions` | `quiz_options`    | One-to-many           | `question_id` | CASCADE   |
| `quizzes`        | `quiz_attempts`   | One-to-many           | `quiz_id`     | RESTRICT  |
| `lessons`        | `lesson_progress` | One-to-many           | `lesson_id`   | RESTRICT  |
| `payments`       | `enrollments`     | One-to-one (nullable) | `payment_id`  | SET NULL  |

---

## 8. Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────

enum UserRole {
  admin
  student
}

enum CourseStatus {
  draft
  published
  archived
}

enum LessonType {
  video
  recording
  resource
}

enum QuestionType {
  mcq
  short_answer
}

enum PaymentStatus {
  pending
  completed
  failed
  refunded
}

enum NotificationType {
  enrollment
  payment
  live_class
  certificate
  account
}

// ─── USERS ───────────────────────────────

model User {
  id                      String    @id @default(uuid())
  name                    String    @db.VarChar(100)
  email                   String    @unique @db.VarChar(255)
  passwordHash            String    @db.VarChar(255)
  role                    UserRole  @default(student)
  isVerified              Boolean   @default(false)
  verificationToken       String?   @db.VarChar(255)
  verificationTokenExpiry DateTime?
  refreshTokenHash        String?   @db.VarChar(255)
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  createdCourses  Course[]         @relation("CourseCreator")
  enrollments     Enrollment[]
  payments        Payment[]
  certificates    Certificate[]
  quizAttempts    QuizAttempt[]
  lessonProgress  LessonProgress[]
  notifications   Notification[]

  @@index([role])
  @@map("users")
}

// ─── COURSES ─────────────────────────────

model Course {
  id           String       @id @default(uuid())
  title        String       @db.VarChar(200)
  description  String       @db.Text
  thumbnailUrl String?      @db.VarChar(500)
  price        Int          @default(0)
  isFree       Boolean      @default(false)
  status       CourseStatus @default(draft)
  createdBy    String
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  creator      User          @relation("CourseCreator", fields: [createdBy], references: [id])
  modules      Module[]
  enrollments  Enrollment[]
  payments     Payment[]
  certificates Certificate[]
  liveClasses  LiveClass[]

  @@index([status])
  @@index([createdBy])
  @@map("courses")
}

// ─── MODULES ─────────────────────────────

model Module {
  id          String   @id @default(uuid())
  courseId    String
  title       String   @db.VarChar(200)
  description String?  @db.Text
  orderIndex  Int
  createdAt   DateTime @default(now())

  course   Course   @relation(fields: [courseId], references: [id])
  lessons  Lesson[]

  @@index([courseId])
  @@index([courseId, orderIndex])
  @@map("modules")
}

// ─── LESSONS ─────────────────────────────
// type = video    → videoId populated (Cloudflare Stream)
// type = recording → videoId populated (Cloudflare Stream, same as video)
// type = resource  → resourceUrl populated (Cloudflare R2)

model Lesson {
  id              String     @id @default(uuid())
  moduleId        String
  title           String     @db.VarChar(200)
  type            LessonType
  videoId         String?    @db.VarChar(255)   // Cloudflare Stream UID
  resourceUrl     String?    @db.VarChar(500)   // Cloudflare R2 URL
  durationSeconds Int?
  orderIndex      Int
  createdAt       DateTime   @default(now())

  module    Module           @relation(fields: [moduleId], references: [id])
  quizzes   Quiz[]
  progress  LessonProgress[]

  @@index([moduleId])
  @@index([moduleId, orderIndex])
  @@index([type])
  @@map("lessons")
}

// ─── ENROLLMENTS ─────────────────────────

model Enrollment {
  id         String   @id @default(uuid())
  studentId  String
  courseId   String
  paymentId  String?
  enrolledAt DateTime @default(now())

  student  User     @relation(fields: [studentId], references: [id])
  course   Course   @relation(fields: [courseId], references: [id])
  payment  Payment? @relation(fields: [paymentId], references: [id])

  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
  @@map("enrollments")
}

// ─── LESSON PROGRESS ─────────────────────

model LessonProgress {
  id          String    @id @default(uuid())
  studentId   String
  lessonId    String
  isCompleted Boolean   @default(false)
  completedAt DateTime?

  student  User   @relation(fields: [studentId], references: [id])
  lesson   Lesson @relation(fields: [lessonId], references: [id])

  @@unique([studentId, lessonId])
  @@index([studentId])
  @@map("lesson_progress")
}

// ─── QUIZZES ─────────────────────────────

model Quiz {
  id           String   @id @default(uuid())
  lessonId     String   @unique
  title        String   @db.VarChar(200)
  passingScore Int
  createdAt    DateTime @default(now())

  lesson    Lesson         @relation(fields: [lessonId], references: [id])
  questions QuizQuestion[]
  attempts  QuizAttempt[]

  @@map("quizzes")
}

// ─── QUIZ QUESTIONS ──────────────────────

model QuizQuestion {
  id           String       @id @default(uuid())
  quizId       String
  questionText String       @db.Text
  questionType QuestionType
  orderIndex   Int
  createdAt    DateTime     @default(now())

  quiz    Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  options QuizOption[]

  @@index([quizId])
  @@map("quiz_questions")
}

// ─── QUIZ OPTIONS ────────────────────────

model QuizOption {
  id         String  @id @default(uuid())
  questionId String
  optionText String  @db.VarChar(500)
  isCorrect  Boolean @default(false)
  orderIndex Int

  question QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@map("quiz_options")
}

// ─── QUIZ ATTEMPTS ───────────────────────

model QuizAttempt {
  id          String   @id @default(uuid())
  studentId   String
  quizId      String
  score       Int
  isPassed    Boolean
  attemptedAt DateTime @default(now())

  student  User  @relation(fields: [studentId], references: [id])
  quiz     Quiz  @relation(fields: [quizId], references: [id])

  @@index([studentId])
  @@index([quizId])
  @@index([studentId, quizId])
  @@map("quiz_attempts")
}

// ─── PAYMENTS (Razorpay only) ────────────

model Payment {
  id                String        @id @default(uuid())
  studentId         String
  courseId          String
  razorpayOrderId   String        @db.VarChar(255)
  razorpayPaymentId String        @unique @db.VarChar(255)
  amount            Int
  currency          String        @default("INR") @db.VarChar(10)
  status            PaymentStatus @default(pending)
  invoiceUrl        String?       @db.VarChar(500)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  student     User        @relation(fields: [studentId], references: [id])
  course      Course      @relation(fields: [courseId], references: [id])
  enrollment  Enrollment?

  @@index([studentId])
  @@index([courseId])
  @@index([status])
  @@map("payments")
}

// ─── CERTIFICATES ────────────────────────

model Certificate {
  id              String   @id @default(uuid())
  studentId       String
  courseId        String
  certificateCode String   @unique @db.VarChar(100)
  pdfUrl          String?  @db.VarChar(500)
  issuedAt        DateTime @default(now())

  student  User   @relation(fields: [studentId], references: [id])
  course   Course @relation(fields: [courseId], references: [id])

  @@unique([studentId, courseId])
  @@index([studentId])
  @@map("certificates")
}

// ─── LIVE CLASSES ────────────────────────

model LiveClass {
  id              String   @id @default(uuid())
  courseId        String
  title           String   @db.VarChar(200)
  zoomMeetingId   String   @db.VarChar(50)
  zoomJoinUrl     String   @db.VarChar(500)
  scheduledAt     DateTime
  durationMinutes Int
  recordingUrl    String?  @db.VarChar(500)
  createdAt       DateTime @default(now())

  course  Course  @relation(fields: [courseId], references: [id])

  @@index([courseId])
  @@index([scheduledAt])
  @@map("live_classes")
}

// ─── NOTIFICATIONS ───────────────────────

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String           @db.VarChar(255)
  message   String           @db.Text
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("notifications")
}
```

---

## 9. Migration Strategy

### Development

```bash
# Edit prisma/schema.prisma
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

### Production (Railway)

```bash
npx prisma migrate deploy
```

Railway deploy command:

```
npx prisma migrate deploy && node dist/main.js
```

### Migration Naming Convention

```
20260101000000_init_users_auth
20260102000000_add_courses_modules_lessons
20260103000000_add_lesson_types_recording
20260104000000_add_enrollments_payments_razorpay
20260105000000_add_quiz_system
20260106000000_add_certificates
20260107000000_add_live_classes
20260108000000_add_notifications_progress
```

### Schema Change Rules

* Never edit migration files after they are applied
* Never drop columns without a deprecation period
* Column renames require two migrations (add → copy → drop)
* Test on staging before production
* Write rollback SQL for critical migrations

---

## 10. Query Patterns Reference

### Enrollment Check (every lesson access)

```typescript
const enrollment = await prisma.enrollment.findFirst({
  where: { studentId, courseId }
});
// Uses: idx_enrollments_student_course
```

### Course Completion Check (certificate trigger)

```typescript
// Must count video + recording + resource lessons
const totalLessons = await prisma.lesson.count({
  where: { module: { courseId } }
});

const completedLessons = await prisma.lessonProgress.count({
  where: {
    studentId,
    isCompleted: true,
    lesson: { module: { courseId } }
  }
});

const totalQuizzes = await prisma.quiz.count({
  where: { lesson: { module: { courseId } } }
});

const passedQuizzes = await prisma.quizAttempt.count({
  where: {
    studentId,
    isPassed: true,
    quiz: { lesson: { module: { courseId } } }
  }
});

const isComplete =
  completedLessons === totalLessons &&
  passedQuizzes === totalQuizzes;
```

### Recording Lesson Access (same as video)

```typescript
// recording lessons use videoId exactly like video lessons
const lesson = await prisma.lesson.findUnique({
  where: { id: lessonId }
});
// lesson.type === 'recording' || 'video' → use videoId for player
// lesson.type === 'resource' → use resourceUrl for download
```

### Razorpay Webhook Idempotency

```typescript
const existing = await prisma.payment.findFirst({
  where: { razorpayPaymentId: paymentId }
});
if (existing) return; // Already processed
// Uses: idx_payments_razorpay_payment_id (UNIQUE)
```

### Certificate Verification

```typescript
const cert = await prisma.certificate.findUnique({
  where: { certificateCode },
  include: {
    student: { select: { name: true } },
    course: { select: { title: true } }
  }
});
// Uses: idx_certificates_code (UNIQUE)
```

---

*End of Database Schema Document v2.0*
