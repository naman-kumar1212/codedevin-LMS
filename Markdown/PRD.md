
# Product Requirements Document (PRD)

## Code Devin Solutions — Learning Management System (LMS)

**Version:** 2.0
**Status:** Phase 1 — Production Specification
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

---

## Table of Contents

1. [Product Vision](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#1-product-vision)
2. [Problem Statement](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#2-problem-statement)
3. [Target Users](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#3-target-users)
4. [User Personas](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#4-user-personas)
5. [User Stories](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#5-user-stories)
6. [Core Features](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#6-core-features)
7. [Functional Requirements](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#7-functional-requirements)
8. [Non-Functional Requirements](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#8-non-functional-requirements)
9. [Success Metrics](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#9-success-metrics)
10. [Constraints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#10-constraints)
11. [Out of Scope (Phase 1)](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#11-out-of-scope-phase-1)
12. [Future Roadmap (Phase 2+)](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#12-future-roadmap-phase-2)

---

## 1. Product Vision

To build a scalable, professional, admin-controlled online learning platform where students can discover, enroll in, and complete structured courses — both free and paid — attend live sessions, watch recorded sessions, and receive verifiable certificates upon successful completion.

The platform is owned and operated entirely by a single administrative entity (Code Devin Solutions). All course content is created and published by the admin. Students interact with the platform as learners and consumers, not as content creators.

---

## 2. Problem Statement

### Core Problems Being Solved

| Problem                                                     | Impact                                             |
| ----------------------------------------------------------- | -------------------------------------------------- |
| No owned platform to sell and deliver courses               | Revenue and brand reliant on third-party platforms |
| No system to manage student progress centrally              | Cannot track learning outcomes                     |
| No verifiable certificate system                            | Certificates can be faked; no public verification  |
| No integrated payment and invoice system                    | Manual billing, no invoice generation              |
| No live class scheduling integrated with courses            | Live sessions disconnected from learning path      |
| No way to make live session recordings available as lessons | Students who miss live classes cannot catch up     |

---

## 3. Target Users

| Role              | Description                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**   | Single operator. Creates all content, manages students, schedules live classes, uploads recordings, monitors payments, issues certificates. |
| **Student** | Registered learner. Browses, enrolls, watches lessons and recordings, takes quizzes, attends live sessions, earns certificates.             |

> **Note:** The Tutor role is explicitly excluded from Phase 1.

---

## 4. User Personas

### Persona 1 — Platform Admin

**Name:** Arjun (Platform Operator)

**Goals:**

* Create and publish structured courses with videos, recordings, resources, and quizzes
* Schedule and run live Zoom classes
* Download Zoom session recordings and upload them to course modules as lessons
* Monitor student progress and issue certificates
* Manage payments and invoices

**Pain Points:**

* No way to make missed live sessions available to students as on-demand content
* Manual certificate issuance process
* Disconnected payment and enrollment systems

---

### Persona 2 — Student Learner

**Name:** Priya (Student)

**Goals:**

* Enroll in free or paid courses; pay securely via Razorpay
* Complete video lessons and quizzes at own pace
* Watch recordings of live sessions she missed
* Attend scheduled live sessions with reminders
* Download a verifiable certificate on completion

---

## 5. User Stories

### Authentication

| ID    | As a... | I want to...                      | So that...                       |
| ----- | ------- | --------------------------------- | -------------------------------- |
| US-01 | Student | Register with email and password  | I can create an account          |
| US-02 | Student | Verify my email via a link        | My account is confirmed          |
| US-03 | Student | Log in securely                   | My session is protected          |
| US-04 | Admin   | Log in and access the admin panel | I can manage the platform        |
| US-05 | Student | Refresh my session automatically  | My experience is not interrupted |

### Course Discovery

| ID    | As a... | I want to...                 | So that...                          |
| ----- | ------- | ---------------------------- | ----------------------------------- |
| US-06 | Student | Browse all published courses | I can discover what is available    |
| US-07 | Student | Filter courses by free/paid  | I can find courses within my budget |
| US-08 | Student | Search courses by keyword    | I can find specific topics quickly  |
| US-09 | Student | View detailed course info    | I can decide whether to enroll      |

### Enrollment & Payments

| ID    | As a... | I want to...                                 | So that...                           |
| ----- | ------- | -------------------------------------------- | ------------------------------------ |
| US-10 | Student | Enroll in a free course instantly            | I can start learning without payment |
| US-11 | Student | Pay for a paid course via Razorpay           | I can access premium content         |
| US-12 | Student | Receive a payment confirmation and invoice   | I have a record of my purchase       |
| US-13 | Student | See a pending state if payment is processing | I am not confused by delays          |

### Learning

| ID    | As a... | I want to...                               | So that...                            |
| ----- | ------- | ------------------------------------------ | ------------------------------------- |
| US-14 | Student | Access enrolled course modules and lessons | I can follow the curriculum           |
| US-15 | Student | Watch video lessons                        | I can learn from recorded content     |
| US-16 | Student | Watch live class recordings as lessons     | I can catch up on sessions I missed   |
| US-17 | Student | Download resource files (PDFs)             | I can refer to supplementary material |
| US-18 | Student | Mark resource lessons as complete          | My progress is tracked accurately     |
| US-19 | Student | Have video progress tracked automatically  | Lessons complete when I watch 80%+    |
| US-20 | Student | Take a quiz attached to a lesson           | I can validate my understanding       |
| US-21 | Student | Retake a failed quiz up to 3 times         | I have fair chances to pass           |
| US-22 | Student | See my overall course progress             | I know how much I have completed      |

### Live Classes

| ID    | As a... | I want to...                              | So that...                         |
| ----- | ------- | ----------------------------------------- | ---------------------------------- |
| US-23 | Student | See upcoming live classes                 | I can plan to attend               |
| US-24 | Student | Join via a Zoom link                      | I can attend real-time instruction |
| US-25 | Student | Receive notifications about sessions      | I am reminded in advance           |
| US-26 | Student | Watch the recording of a session I missed | I do not fall behind               |

### Certificates

| ID    | As a... | I want to...                                        | So that...                                |
| ----- | ------- | --------------------------------------------------- | ----------------------------------------- |
| US-27 | Student | Receive an auto-generated certificate on completion | I have proof of completion                |
| US-28 | Student | Download my certificate as a PDF                    | I can share or print it                   |
| US-29 | Anyone  | Verify a certificate via a public URL               | Certificate authenticity can be confirmed |

### Admin — Content Management

| ID    | As an... | I want to...                                       | So that...                                |
| ----- | -------- | -------------------------------------------------- | ----------------------------------------- |
| US-30 | Admin    | Create a course with all metadata                  | Students can discover and enroll          |
| US-31 | Admin    | Add modules and lessons                            | The course has structured curriculum      |
| US-32 | Admin    | Upload video lessons to Cloudflare Stream          | Videos stream via CDN without server load |
| US-33 | Admin    | Upload live class recordings to Cloudflare Stream  | Students can watch missed sessions        |
| US-34 | Admin    | Upload resource files to lessons                   | Students have supplementary materials     |
| US-35 | Admin    | Create quizzes with MCQ and short-answer questions | Student comprehension can be validated    |
| US-36 | Admin    | Publish, archive, or draft courses                 | I control what students can see           |

### Admin — Platform Management

| ID    | As an... | I want to...                                       | So that...                         |
| ----- | -------- | -------------------------------------------------- | ---------------------------------- |
| US-37 | Admin    | View student overview with analytics               | I can monitor platform performance |
| US-38 | Admin    | Schedule a live class and auto-create Zoom meeting | Students are notified with a link  |
| US-39 | Admin    | View all payment transactions                      | I can manage billing               |
| US-40 | Admin    | Manually issue a certificate                       | I can handle exceptional cases     |

---

## 6. Core Features

### F1 — Authentication & Roles

JWT access and refresh tokens. Two roles: admin and student. Email verification required. Admin routes hidden and middleware-protected.

### F2 — Course Management System

* Module hierarchy: Course → Module → Lesson
* Three lesson types: `video`, `recording`, `resource`
* Course lifecycle: draft → published → archived
* Free and paid pricing

### F3 — Video Delivery (Cloudflare Stream)

All video and recording content uploaded to and streamed from Cloudflare Stream via pre-signed upload URLs. The Cloudflare Stream player is embedded in lesson pages. No video data is routed through the application server.

### F4 — Live Class Recording Workflow

1. Admin conducts Zoom live session
2. Admin manually downloads recording from Zoom dashboard
3. Admin uploads recording to LMS via admin panel (to Cloudflare Stream)
4. Admin creates a `recording` lesson in any course module and attaches the Stream video ID
5. Students access recording exactly like a video lesson
6. Access follows course enrollment rules (free/paid)

Automated Zoom recording import is  **not implemented in Phase 1** .

### F5 — Quiz & Assessment System

Optional per-lesson quizzes. MCQ and short-answer types. Configurable passing score. Maximum 3 attempts per student.

### F6 — Course Progress Tracking

* Video/recording lessons: complete at 80–90% watch time
* Resource lessons: complete on "Mark Complete" click
* Overall progress shown as percentage

### F7 — Enrollment System

* Free: direct enrollment
* Paid: Razorpay checkout → webhook verification → enrollment created

### F8 — Payment & Billing (Razorpay Only)

* Razorpay for all INR payments
* Invoice generation per transaction
* Transaction history in admin dashboard
* **Stripe is not implemented**

### F9 — Certificate Generation & Verification

* Auto-generated on course completion
* PDF via React template + Puppeteer
* Stored on Cloudflare R2
* Unique code: `CDS-{COURSEID}-{USERID}-{YEAR}`
* QR code linking to `/verify/{certificateCode}`

### F10 — Live Class System

* Admin schedules from dashboard
* Zoom API auto-creates meeting
* Students notified via email + in-app
* Admin manually uploads recording post-session

### F11 — Notification System

* In-platform notification center
* Email via Resend
* Events: verification, enrollment, payment, live class, certificate

### F12 — Admin Dashboard

Course creation, student analytics, live class scheduling, payment monitoring, certificate management.

---

## 7. Functional Requirements

### 7.1 Authentication

| ID     | Requirement                                                               |
| ------ | ------------------------------------------------------------------------- |
| FR-A01 | Email and password required for registration                              |
| FR-A02 | Passwords hashed with bcrypt (rounds: 12)                                 |
| FR-A03 | Verification email sent with 24-hour expiry token                         |
| FR-A04 | Login denied if account is unverified                                     |
| FR-A05 | Login returns JWT access token (15m) and refresh token (7d)               |
| FR-A06 | Refresh tokens stored server-side; invalidated on logout                  |
| FR-A07 | Refresh token rotation implemented                                        |
| FR-A08 | Role encoded in JWT payload                                               |
| FR-A09 | Admin routes protected by role middleware (frontend) and guards (backend) |

### 7.2 Course Management

| ID     | Requirement                                                                     |
| ------ | ------------------------------------------------------------------------------- |
| FR-C01 | Admin creates course with title, description, thumbnail, price, free/paid flag  |
| FR-C02 | Course status: draft, published, archived                                       |
| FR-C03 | Course not publishable without at least one module with one lesson              |
| FR-C04 | Admin creates ordered modules within a course                                   |
| FR-C05 | Admin creates ordered lessons within a module                                   |
| FR-C06 | Lessons support three types: video, recording, resource                         |
| FR-C07 | Video and recording lessons store Cloudflare Stream video ID (not URL)          |
| FR-C08 | Recording lessons behave identically to video lessons for playback and progress |

### 7.3 Video & Recording Upload (Cloudflare Stream)

| ID     | Requirement                                                                |
| ------ | -------------------------------------------------------------------------- |
| FR-V01 | Backend generates pre-signed Cloudflare Stream upload URL on admin request |
| FR-V02 | Admin uploads video/recording directly from browser to Cloudflare Stream   |
| FR-V03 | Returned Cloudflare Stream video ID stored in lesson record                |
| FR-V04 | Videos and recordings delivered via Cloudflare Stream player               |
| FR-V05 | Progress tracked client-side; submitted to API when ≥ 80% watched         |

### 7.4 Quiz System

| ID     | Requirement                                           |
| ------ | ----------------------------------------------------- |
| FR-Q01 | Quizzes optional; attachable to any lesson            |
| FR-Q02 | MCQ and short-answer question types supported         |
| FR-Q03 | MCQ options have exactly one correct answer           |
| FR-Q04 | Per-quiz configurable passing score                   |
| FR-Q05 | Maximum 3 attempts per student per quiz               |
| FR-Q06 | Each attempt recorded with score and pass/fail        |
| FR-Q07 | Lesson with quiz is complete only when quiz is passed |

### 7.5 Enrollment & Payments

| ID     | Requirement                                                                      |
| ------ | -------------------------------------------------------------------------------- |
| FR-P01 | Free course enrollment creates record immediately                                |
| FR-P02 | Paid course enrollment initiates Razorpay payment session                        |
| FR-P03 | Enrollment created only after webhook HMAC signature verified                    |
| FR-P04 | Payment records store: student, course, transaction ID, amount, currency, status |
| FR-P05 | Invoice generated per successful payment                                         |
| FR-P06 | Stripe must not be implemented at any layer                                      |

### 7.6 Certificates

| ID      | Requirement                                                               |
| ------- | ------------------------------------------------------------------------- |
| FR-CE01 | Auto-generated when all lessons complete and all quizzes passed           |
| FR-CE02 | PDF generated with React template + Puppeteer                             |
| FR-CE03 | Certificate includes student name, course name, issue date, code, QR code |
| FR-CE04 | Code format:`CDS-{COURSEID}-{USERID}-{YEAR}`                            |
| FR-CE05 | PDF stored on Cloudflare R2                                               |
| FR-CE06 | Public verification endpoint returns certificate details by code          |
| FR-CE07 | Admin can manually issue a certificate                                    |

### 7.7 Live Classes

| ID     | Requirement                                                                      |
| ------ | -------------------------------------------------------------------------------- |
| FR-L01 | Admin schedules live class from dashboard                                        |
| FR-L02 | Backend calls Zoom API; stores meeting ID and join URL                           |
| FR-L03 | Enrolled students notified when class is scheduled                               |
| FR-L04 | Students join via Zoom link from dashboard                                       |
| FR-L05 | Admin uploads recording and attaches to a course module as a `recording`lesson |
| FR-L06 | Automated Zoom recording import not implemented in Phase 1                       |

### 7.8 Notifications

| ID     | Requirement                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------- |
| FR-N01 | Notifications stored in database per user                                                               |
| FR-N02 | Email sent via Resend for all trigger events                                                            |
| FR-N03 | Trigger events: account verified, enrolled, payment confirmed, live class scheduled, certificate issued |
| FR-N04 | Students can mark notifications as read                                                                 |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID      | Requirement                                    |
| ------- | ---------------------------------------------- |
| NFR-P01 | Platform must support ~1,000 users in Year 1   |
| NFR-P02 | API course listing response under 500ms at p95 |
| NFR-P03 | Certificate generation async via BullMQ        |
| NFR-P04 | Email dispatch via BullMQ workers              |

### 8.2 Security

| ID      | Requirement                                                             |
| ------- | ----------------------------------------------------------------------- |
| NFR-S01 | Passwords stored with bcrypt                                            |
| NFR-S02 | JWT in HTTP-only cookies                                                |
| NFR-S03 | NestJS DTO validation on all endpoints                                  |
| NFR-S04 | Razorpay webhook HMAC signature verified before processing              |
| NFR-S05 | Rate limiting on login, payment, quiz endpoints                         |
| NFR-S06 | Admin routes role-guarded on frontend (middleware) and backend (guards) |
| NFR-S07 | Video content served via Cloudflare Stream only                         |
| NFR-S08 | All API communication over HTTPS                                        |

### 8.3 Scalability

| ID       | Requirement                                            |
| -------- | ------------------------------------------------------ |
| NFR-SC01 | Modular monolith backend for future service extraction |
| NFR-SC02 | Heavy operations via BullMQ queues                     |
| NFR-SC03 | Non-video files in Cloudflare R2                       |
| NFR-SC04 | Video via Cloudflare Stream CDN                        |

### 8.4 Usability

| ID      | Requirement                                                     |
| ------- | --------------------------------------------------------------- |
| NFR-U01 | Desktop-first; responsive to tablet (768px) and mobile (<768px) |
| NFR-U02 | Sidebar collapses to drawer on tablet/mobile                    |
| NFR-U03 | All empty states have guidance text and a CTA                   |
| NFR-U04 | All error states explicitly handled                             |

---

## 9. Success Metrics

| Metric                              | Target  |
| ----------------------------------- | ------- |
| Registered students (Year 1)        | ~1,000  |
| Courses published                   | 10+     |
| Course completion rate              | > 40%   |
| Certificate generation success rate | 100%    |
| Payment success rate                | > 95%   |
| API uptime                          | > 99.5% |

---

## 10. Constraints

### Technical Constraints

| Constraint         | Detail                                    |
| ------------------ | ----------------------------------------- |
| Video platform     | Cloudflare Stream only                    |
| Payment gateway    | Razorpay only — Stripe excluded entirely |
| Frontend hosting   | Vercel                                    |
| Backend hosting    | Railway                                   |
| File storage       | Cloudflare R2                             |
| Email              | Resend                                    |
| Live classes       | Zoom API                                  |
| ORM                | Prisma                                    |
| Backend framework  | NestJS                                    |
| Frontend framework | Next.js 14+ App Router                    |
| Database           | PostgreSQL                                |
| Queue              | Redis + BullMQ                            |
| Zoom recording     | Manual admin upload — no automation      |

### Business Constraints

| Constraint         | Detail                |
| ------------------ | --------------------- |
| Content creation   | Admin only in Phase 1 |
| Subscription model | Excluded from Phase 1 |
| Tutor role         | Excluded from Phase 1 |
| Mobile app         | Excluded from Phase 1 |
| Discussion forums  | Excluded from Phase 1 |

---

## 11. Out of Scope (Phase 1)

* Tutor role or multi-vendor content
* Stripe payment gateway
* Automated Zoom recording import
* Subscription billing
* Mobile applications
* Discussion forums
* Referral programs
* WhatsApp notifications
* Dark mode
* Multi-language / i18n
* 2FA

---

## 12. Future Roadmap (Phase 2+)

**Phase 2:** Tutor role, multi-vendor content, revenue sharing
**Phase 3:** Discussion forums, automated recording import
**Phase 4:** Mobile apps, referral system, subscription model
**Phase 5:** WhatsApp notifications, advanced analytics, proctored assessments

---

*End of PRD v2.0*
