
# API Design Document

## Code Devin Solutions — Learning Management System (LMS)

**Version:** 2.0
**Status:** Phase 1 — Production API Specification
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

---

## Table of Contents

1. [API Conventions](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#1-api-conventions)
2. [Authentication](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#2-authentication)
3. [Standard Response Envelopes](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#3-standard-response-envelopes)
4. [Error Codes Reference](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#4-error-codes-reference)
5. [Auth Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#5-auth-endpoints)
6. [Users Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#6-users-endpoints)
7. [Courses Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#7-courses-endpoints)
8. [Modules Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#8-modules-endpoints)
9. [Lessons Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#9-lessons-endpoints)
10. [Video Endpoints (Cloudflare Stream)](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#10-video-endpoints)
11. [File Storage Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#11-file-storage-endpoints)
12. [Progress Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#12-progress-endpoints)
13. [Quiz Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#13-quiz-endpoints)
14. [Enrollment Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#14-enrollment-endpoints)
15. [Payment Endpoints (Razorpay Only)](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#15-payment-endpoints)
16. [Certificate Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#16-certificate-endpoints)
17. [Live Classes Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#17-live-classes-endpoints)
18. [Notification Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#18-notification-endpoints)
19. [Admin Endpoints](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#19-admin-endpoints)
20. [Health Endpoint](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#20-health-endpoint)
21. [Pagination Convention](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#21-pagination-convention)
22. [Rate Limiting Headers](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#22-rate-limiting-headers)
23. [Endpoint Index](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#23-endpoint-index)

---

## 1. API Conventions

### Base URL

```
Production:   https://api.codedevin.com/api/v1
Development:  http://localhost:3001/api/v1
```

### Content Type

All requests with a body: `Content-Type: application/json`
Webhook endpoints receive raw body (for HMAC signature verification).

### Authentication Transport

HTTP-only cookies. Set by backend on login. Frontend sends via `withCredentials: true`.

### Auth Annotations Used in This Document

| Annotation    | Meaning                                           |
| ------------- | ------------------------------------------------- |
| 🔓 Public     | No authentication required                        |
| 🔐 Student    | Valid JWT required; role must be `student`      |
| 🔑 Admin      | Valid JWT required; role must be `admin`        |
| 🔐🔑 Any Auth | Valid JWT required; either role                   |
| 🔓 Webhook    | No JWT; uses Razorpay HMAC signature verification |

---

## 2. Authentication

| Token             | Expiry     | Storage                                   |
| ----------------- | ---------- | ----------------------------------------- |
| `access_token`  | 15 minutes | HTTP-only cookie                          |
| `refresh_token` | 7 days     | HTTP-only cookie (path:`/auth/refresh`) |

---

## 3. Standard Response Envelopes

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

**Paginated Success:**

```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "total": 150, "page": 1, "limit": 20, "totalPages": 8 },
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

**Error:**

```json
{
  "success": false,
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "Not enrolled in this course",
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

---

## 4. Error Codes Reference

| HTTP | Code                        | Meaning                             |
| ---- | --------------------------- | ----------------------------------- |
| 400  | `BAD_REQUEST`             | Invalid input or business rule      |
| 400  | `VALIDATION_ERROR`        | DTO validation failed               |
| 401  | `UNAUTHORIZED`            | Missing or invalid token            |
| 403  | `FORBIDDEN`               | Insufficient role or access         |
| 403  | `EMAIL_NOT_VERIFIED`      | Login before verification           |
| 403  | `QUIZ_ATTEMPTS_EXHAUSTED` | Max 3 attempts used                 |
| 403  | `NOT_ENROLLED`            | Content accessed without enrollment |
| 404  | `NOT_FOUND`               | Resource not found                  |
| 409  | `ALREADY_ENROLLED`        | Student already enrolled            |
| 409  | `DUPLICATE_EMAIL`         | Email already registered            |
| 409  | `QUIZ_EXISTS`             | Lesson already has a quiz           |
| 422  | `COURSE_NOT_PUBLISHABLE`  | Course fails publish validation     |
| 429  | `RATE_LIMITED`            | Too many requests                   |
| 503  | `ZOOM_UNAVAILABLE`        | Zoom API call failed                |

---

## 5. Auth Endpoints

### POST /auth/register

**Auth:** 🔓 Public | **Rate Limit:** 3/min

**Request:**

```json
{ "name": "Priya Sharma", "email": "priya@example.com", "password": "MyPassword1" }
```

**Validation:** name 2–100 chars; valid email; password 8–128 chars with uppercase, lowercase, number.

**Response: 201**

```json
{ "success": true, "data": { "message": "Registration successful. Please check your email to verify your account." } }
```

---

### GET /auth/verify/:token

**Auth:** 🔓 Public

**Response: 200**

```json
{ "success": true, "data": { "message": "Email verified successfully. You can now log in." } }
```

---

### POST /auth/login

**Auth:** 🔓 Public | **Rate Limit:** 5/min

**Request:**

```json
{ "email": "priya@example.com", "password": "MyPassword1" }
```

**Response: 200** — Sets `access_token` (15m) and `refresh_token` (7d) HTTP-only cookies.

```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "Priya Sharma", "email": "priya@example.com", "role": "student" }
  }
}
```

---

### POST /auth/refresh

**Auth:** 🔓 Public (refresh token cookie)

Sets new `access_token` cookie; rotates refresh token.

**Response: 200**

```json
{ "success": true, "data": { "message": "Token refreshed successfully." } }
```

---

### POST /auth/logout

**Auth:** 🔐🔑 Any Auth

Clears cookies; invalidates refresh token server-side.

**Response: 200**

```json
{ "success": true, "data": { "message": "Logged out successfully." } }
```

---

## 6. Users Endpoints

### GET /users/me

**Auth:** 🔐🔑 Any Auth

**Response: 200**

```json
{
  "success": true,
  "data": { "id": "uuid", "name": "Priya Sharma", "email": "priya@example.com", "role": "student", "createdAt": "..." }
}
```

### PATCH /users/me

**Auth:** 🔐🔑 Any Auth

**Request:** `{ "name": "Priya S." }`
**Response: 200** — Updated user object.

---

## 7. Courses Endpoints

### GET /courses

**Auth:** 🔓 Public

**Query:** `page`, `limit`, `type` (free|paid), `search`

**Response: 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "title": "Node.js Fundamentals",
      "thumbnailUrl": "https://r2.../thumb.jpg",
      "price": 99900, "isFree": false,
      "_count": { "modules": 5, "enrollments": 234 }
    }
  ],
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

### GET /courses/:courseId

**Auth:** 🔓 Public

**Response: 200**

```json
{
  "success": true,
  "data": {
    "id": "uuid", "title": "Node.js Fundamentals",
    "price": 99900, "isFree": false,
    "modules": [
      {
        "id": "uuid", "title": "Getting Started", "orderIndex": 1,
        "lessons": [
          {
            "id": "uuid", "title": "Introduction",
            "type": "video", "durationSeconds": 1200,
            "orderIndex": 1, "hasQuiz": true
          },
          {
            "id": "uuid", "title": "Week 1 Live Q&A",
            "type": "recording", "durationSeconds": 3600,
            "orderIndex": 2, "hasQuiz": false
          }
        ]
      }
    ]
  }
}
```

**Note:** `videoId` is NOT returned in public course detail (security). `type` may be `video`, `recording`, or `resource`.

---

### POST /courses

**Auth:** 🔑 Admin

**Request:**

```json
{
  "title": "Node.js Fundamentals",
  "description": "Learn Node.js from scratch...",
  "price": 99900,
  "isFree": false,
  "thumbnailUrl": "https://r2.../thumb.jpg"
}
```

**Response: 201**

```json
{ "success": true, "data": { "id": "uuid", "title": "...", "status": "draft", "createdAt": "..." } }
```

---

### PATCH /courses/:courseId

**Auth:** 🔑 Admin — Partial update. Returns updated course object.

### PATCH /courses/:courseId/publish

**Auth:** 🔑 Admin

Validates: at least 1 module with 1 lesson; all video/recording lessons have `videoId`; all resource lessons have `resourceUrl`.

**Response: 200**

```json
{ "success": true, "data": { "id": "uuid", "status": "published" } }
```

**Error (422):**

```json
{ "statusCode": 422, "code": "COURSE_NOT_PUBLISHABLE", "message": "Module 'Getting Started' has no lessons" }
```

### PATCH /courses/:courseId/archive

**Auth:** 🔑 Admin — Sets status to `archived`.

---

## 8. Modules Endpoints

### POST /courses/:courseId/modules

**Auth:** 🔑 Admin

**Request:** `{ "title": "Getting Started", "description": "...", "orderIndex": 1 }`
**Response: 201** — Created module object.

### PATCH /modules/:moduleId

**Auth:** 🔑 Admin — Update title, description, or orderIndex.

### DELETE /modules/:moduleId

**Auth:** 🔑 Admin

---

## 9. Lessons Endpoints

### POST /modules/:moduleId/lessons

**Auth:** 🔑 Admin

**Request:**

```json
{ "title": "Introduction to Node.js", "type": "video", "orderIndex": 1 }
```

**For a live session recording:**

```json
{ "title": "Week 1 Live Q&A Session", "type": "recording", "orderIndex": 2 }
```

**Validation:**

* `type`: must be `"video"`, `"recording"`, or `"resource"`

**Response: 201**

```json
{
  "success": true,
  "data": { "id": "uuid", "moduleId": "uuid", "title": "...", "type": "video", "videoId": null, "orderIndex": 1 }
}
```

---

### PATCH /lessons/:lessonId

**Auth:** 🔑 Admin

Used to attach `videoId` (after Cloudflare Stream upload) or `resourceUrl` (after R2 upload).

**Request (attaching video/recording):**

```json
{ "videoId": "cloudflare-stream-uid-abc123", "durationSeconds": 1200 }
```

**Request (attaching resource):**

```json
{ "resourceUrl": "https://r2.../resources/lesson-uuid/guide.pdf" }
```

**Response: 200** — Updated lesson object.

---

### GET /lessons/:lessonId

**Auth:** 🔐 Student (enrollment required)

**Response: 200**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Week 1 Live Q&A Session",
    "type": "recording",
    "videoId": "cloudflare-stream-uid-abc123",
    "durationSeconds": 3600,
    "resourceUrl": null,
    "isCompleted": false,
    "hasQuiz": false,
    "module": { "id": "uuid", "title": "Getting Started", "courseId": "uuid" }
  }
}
```

**Notes:**

* `videoId` is returned here because enrollment is verified
* `type = "recording"` signals the frontend to show "Live Session Recording" label
* Progress tracking is identical for `video` and `recording` types

### DELETE /lessons/:lessonId

**Auth:** 🔑 Admin

---

## 10. Video Endpoints (Cloudflare Stream)

Used for uploading both `video` and `recording` lesson content.

### POST /videos/upload-url

**Auth:** 🔑 Admin

Generates a Cloudflare Stream direct upload URL.

**Request:**

```json
{ "filename": "week1-live-session.mp4" }
```

**Response: 200**

```json
{
  "success": true,
  "data": {
    "videoId": "cloudflare-stream-uid-abc123",
    "uploadUrl": "https://upload.videodelivery.net/...?tusprotocol=..."
  }
}
```

**Upload Flow:**

1. Admin calls this endpoint to get `uploadUrl` and `videoId`
2. Admin browser PUTs or uses TUS protocol to upload directly to `uploadUrl`
3. No video data goes through the NestJS backend
4. After upload, admin calls `PATCH /lessons/:id { videoId }` to attach

---

### GET /videos/:videoId/status

**Auth:** 🔑 Admin

Polls Cloudflare Stream for processing status.

**Response: 200**

```json
{
  "success": true,
  "data": {
    "videoId": "cloudflare-stream-uid-abc123",
    "status": "ready",
    "readyToStream": true,
    "durationSeconds": 3612
  }
}
```

**Status values:** `"pendingupload"` | `"downloading"` | `"queued"` | `"inprogress"` | `"ready"` | `"error"`

**Note:** Lesson player is available only when `readyToStream: true`.

---

## 11. File Storage Endpoints

### POST /files/upload-url

**Auth:** 🔑 Admin

Generates a Cloudflare R2 pre-signed upload URL for non-video assets.

**Request:**

```json
{ "type": "thumbnail", "referenceId": "course-uuid" }
```

**Validation:** `type`: `"thumbnail"` or `"resource"`

**Response: 200**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://r2-presigned-url...",
    "publicUrl": "https://cdn.codedevin.com/thumbnails/course-uuid/1705312200000"
  }
}
```

---

## 12. Progress Endpoints

### POST /progress/video

**Auth:** 🔐 Student

Applies to both `video` and `recording` lesson types.

**Request:**

```json
{ "lessonId": "uuid", "watchedPercentage": 85.4 }
```

**Response: 200**

```json
{
  "success": true,
  "data": { "lessonId": "uuid", "isCompleted": true, "courseCompleted": false }
}
```

**Notes:**

* Lesson marked complete when `watchedPercentage >= 80`
* `courseCompleted: true` triggers certificate generation job
* Idempotent — safe to call multiple times

---

### POST /progress/resource

**Auth:** 🔐 Student

**Request:** `{ "lessonId": "uuid" }`
**Response: 200** — Same as video progress response.

---

### GET /courses/:courseId/progress

**Auth:** 🔐 Student

**Response: 200**

```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "totalLessons": 24,
    "completedLessons": 10,
    "percentage": 42,
    "modules": [
      {
        "moduleId": "uuid", "title": "Getting Started",
        "totalLessons": 4, "completedLessons": 4,
        "lessons": [
          { "lessonId": "uuid", "title": "Introduction", "type": "video", "isCompleted": true },
          { "lessonId": "uuid", "title": "Week 1 Q&A", "type": "recording", "isCompleted": true }
        ]
      }
    ]
  }
}
```

---

## 13. Quiz Endpoints

### POST /lessons/:lessonId/quiz

**Auth:** 🔑 Admin

**Request:** `{ "title": "Module 1 Quiz", "passingScore": 70 }`
**Response: 201** — Quiz object.
**Error (409):** `QUIZ_EXISTS` if lesson already has a quiz.

---

### POST /quizzes/:quizId/questions

**Auth:** 🔑 Admin

**Request (MCQ):**

```json
{
  "questionText": "What does Node.js run on?",
  "questionType": "mcq",
  "orderIndex": 1,
  "options": [
    { "text": "V8 JavaScript Engine", "isCorrect": true },
    { "text": "SpiderMonkey", "isCorrect": false },
    { "text": "JavaScriptCore", "isCorrect": false }
  ]
}
```

**Request (Short Answer):**

```json
{ "questionText": "Explain the event loop.", "questionType": "short_answer", "orderIndex": 2 }
```

---

### GET /lessons/:lessonId/quiz

**Auth:** 🔐 Student

**Response: 200**

```json
{
  "success": true,
  "data": {
    "id": "uuid", "title": "Module 1 Quiz", "passingScore": 70,
    "attemptsUsed": 1, "attemptsRemaining": 2,
    "questions": [
      {
        "id": "uuid", "questionText": "What does Node.js run on?",
        "questionType": "mcq", "orderIndex": 1,
        "options": [
          { "id": "uuid", "optionText": "V8 JavaScript Engine" },
          { "id": "uuid", "optionText": "SpiderMonkey" }
        ]
      }
    ]
  }
}
```

**Note:** `isCorrect` never included in student response. Options are shuffled.

---

### POST /quizzes/:quizId/attempt

**Auth:** 🔐 Student | **Rate Limit:** 10/5min

**Request:**

```json
{
  "answers": {
    "question-uuid-1": "option-uuid-correct",
    "question-uuid-2": "The event loop is..."
  }
}
```

**Response: 200**

```json
{
  "success": true,
  "data": {
    "score": 75, "isPassed": true, "passingScore": 70,
    "attemptsUsed": 2, "attemptsRemaining": 1,
    "lessonCompleted": true
  }
}
```

**Error (403):** `QUIZ_ATTEMPTS_EXHAUSTED` if 3 attempts already used.

---

## 14. Enrollment Endpoints

### POST /courses/:courseId/enroll

**Auth:** 🔐 Student (free courses only)

**Response: 201** — Enrollment object.
**Errors:** `FORBIDDEN` (course is paid), `ALREADY_ENROLLED`, `NOT_FOUND`.

---

### GET /students/me/courses

**Auth:** 🔐 Student

**Response: 200** — Paginated list of enrolled courses with progress.

---

### GET /courses/:courseId/access

**Auth:** 🔐 Student

**Response: 200**

```json
{ "success": true, "data": { "isEnrolled": true, "enrolledAt": "2026-01-10T00:00:00.000Z" } }
```

**Error (403):** `NOT_ENROLLED`

---

## 15. Payment Endpoints (Razorpay Only)

> **Stripe is not implemented.** There is no Stripe endpoint, no gateway selector, and no Stripe configuration anywhere in this system.

### POST /payments/create

**Auth:** 🔐 Student | **Rate Limit:** 10/min

**Request:**

```json
{ "courseId": "uuid" }
```

**Note:** No `gateway` field — Razorpay is the only option.

**Response: 200**

```json
{
  "success": true,
  "data": {
    "orderId": "order_XXXXXXXXXXXXXX",
    "amount": 99900,
    "currency": "INR",
    "keyId": "rzp_live_XXXXXXXXXX"
  }
}
```

**Errors:** `BAD_REQUEST` (course is free), `NOT_FOUND`, `ALREADY_ENROLLED`.

---

### POST /payments/webhook/razorpay

**Auth:** 🔓 Webhook (HMAC-SHA256 signature)

**Headers required:** `x-razorpay-signature: <hmac_signature>`

**Processing:**

1. Verify HMAC-SHA256 signature using `razorpay.webhookSecret`
2. Check idempotency via `razorpay_payment_id` uniqueness
3. Create payment record
4. Create enrollment record
5. Queue payment notification

**Response: 200** `{ "received": true }`

**Note:** Always returns 200 to acknowledge receipt. Signature failure returns 401 but Razorpay still considers delivery successful on 200 only.

---

### GET /payments/invoice/:paymentId

**Auth:** 🔐 Student (own payments only)

**Response: 200**

```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "invoiceUrl": "https://r2.../invoices/uuid/invoice.pdf",
    "amount": 99900, "currency": "INR",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

---

### POST /payments/:paymentId/refund

**Auth:** 🔑 Admin

**Request:** `{ "reason": "Student requested within refund period" }`

**Response: 200**

```json
{ "success": true, "data": { "paymentId": "uuid", "status": "refunded" } }
```

---

### GET /admin/payments

**Auth:** 🔑 Admin

**Query:** `page`, `limit`, `status`, `from`, `to`

**Response: 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "student": { "name": "Priya Sharma", "email": "priya@example.com" },
      "course": { "title": "Node.js Fundamentals" },
      "razorpayPaymentId": "pay_XXXXXXXXXXXXXX",
      "amount": 99900, "currency": "INR",
      "status": "completed",
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "total": 842, "page": 1, "limit": 20, "totalPages": 43 }
}
```

---

## 16. Certificate Endpoints

### GET /certificates

**Auth:** 🔐 Student

**Response: 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "certificateCode": "CDS-A1B2C3D4-E5F6G7H8-2026",
      "pdfUrl": "https://r2.../certificates/.../certificate.pdf",
      "issuedAt": "2026-01-15T10:30:00.000Z",
      "course": { "id": "uuid", "title": "Node.js Fundamentals" }
    }
  ]
}
```

---

### GET /certificates/verify/:certificateCode

**Auth:** 🔓 Public

**Response: 200**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "studentName": "Priya Sharma",
    "courseName": "Node.js Fundamentals",
    "issuedAt": "2026-01-15T00:00:00.000Z",
    "certificateCode": "CDS-A1B2C3D4-E5F6G7H8-2026"
  }
}
```

**Error (404):** `NOT_FOUND` — No certificate found for this code.

---

### POST /admin/certificates/issue

**Auth:** 🔑 Admin

**Request:** `{ "studentId": "uuid", "courseId": "uuid" }`

**Response: 200**

```json
{ "success": true, "data": { "message": "Certificate generation has been queued." } }
```

**Errors:** `NOT_FOUND` (student or course), `CONFLICT` (already issued).

---

## 17. Live Classes Endpoints

### POST /live-classes

**Auth:** 🔑 Admin

**Request:**

```json
{
  "courseId": "uuid",
  "title": "Live Q&A Session — Week 2",
  "scheduledAt": "2026-02-10T14:00:00.000Z",
  "durationMinutes": 90
}
```

**Response: 201**

```json
{
  "success": true,
  "data": {
    "id": "uuid", "courseId": "uuid",
    "title": "Live Q&A Session — Week 2",
    "zoomMeetingId": "82345678901",
    "zoomJoinUrl": "https://zoom.us/j/82345678901",
    "scheduledAt": "2026-02-10T14:00:00.000Z",
    "durationMinutes": 90
  }
}
```

**Errors:** `BAD_REQUEST` (scheduledAt in past), `NOT_FOUND` (course), `ZOOM_UNAVAILABLE`.

---

### GET /courses/:courseId/live-classes

**Auth:** 🔐 Student

**Query:** `status` (`upcoming` | `past`)

**Response: 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "title": "Live Q&A — Week 2",
      "zoomJoinUrl": "https://zoom.us/j/82345678901",
      "scheduledAt": "2026-02-10T14:00:00.000Z",
      "durationMinutes": 90,
      "recordingUrl": null
    }
  ]
}
```

---

### PATCH /live-classes/:classId/recording

**Auth:** 🔑 Admin

After admin uploads the recording to Cloudflare Stream and attaches it to a course module as a `recording` lesson, this endpoint optionally stores the reference URL on the live_class record.

**Request:** `{ "recordingUrl": "https://cloudflarestream.com/..." }`
**Response: 200** — Updated live class object.

---

### GET /admin/live-classes

**Auth:** 🔑 Admin

**Query:** `page`, `limit`, `courseId`

**Response: 200** — Paginated list with enrollment count per session.

---

## 18. Notification Endpoints

### GET /notifications

**Auth:** 🔐 Student

**Query:** `page`, `limit`, `unread` (boolean)

**Response: 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "type": "certificate",
      "title": "Certificate Issued",
      "message": "Your certificate for Node.js Fundamentals is ready.",
      "isRead": false, "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "total": 12, "unreadCount": 3, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### PATCH /notifications/read

**Auth:** 🔐 Student — Mark all as read.

**Response: 200** `{ "success": true, "data": { "updatedCount": 3 } }`

### PATCH /notifications/:notificationId/read

**Auth:** 🔐 Student — Mark one as read.

---

## 19. Admin Endpoints

### GET /admin/dashboard/stats

**Auth:** 🔑 Admin

**Response: 200**

```json
{
  "success": true,
  "data": {
    "totalStudents": 847,
    "totalEnrollments": 2341,
    "paidEnrollments": 1204,
    "freeEnrollments": 1137,
    "totalRevenue": 120289600,
    "totalCertificates": 612,
    "publishedCourses": 12,
    "recentEnrollments": [ ... ],
    "upcomingLiveClasses": [ ... ]
  }
}
```

---

### GET /admin/students

**Auth:** 🔑 Admin

**Query:** `page`, `limit`, `search`

**Response: 200** — Paginated student list with enrollment count.

---

### GET /admin/students/:studentId

**Auth:** 🔑 Admin

**Response: 200** — Student detail with all enrollments (including progress), certificates.

---

### GET /admin/analytics

**Auth:** 🔑 Admin

**Query:** `from`, `to` (ISO date range)

**Response: 200**

```json
{
  "success": true,
  "data": {
    "studentGrowth": [
      { "date": "2026-01", "count": 120 },
      { "date": "2026-02", "count": 180 }
    ],
    "revenueByMonth": [
      { "date": "2026-01", "amount": 45000000 }
    ],
    "enrollmentBreakdown": { "paid": 1204, "free": 1137 },
    "topCourses": [
      { "courseId": "uuid", "title": "Node.js Fundamentals", "enrollments": 342 }
    ],
    "completionRates": [
      { "courseId": "uuid", "title": "...", "rate": 0.42 }
    ]
  }
}
```

---

### GET /admin/certificates

**Auth:** 🔑 Admin

**Query:** `page`, `limit`, `courseId`

**Response: 200** — Paginated certificate list with student and course info.

---

## 20. Health Endpoint

### GET /health

**Auth:** 🔓 Public

**Response: 200**

```json
{ "status": "ok", "database": "connected", "redis": "connected", "timestamp": "...", "uptime": 86400 }
```

---

## 21. Pagination Convention

| Parameter | Default | Max    |
| --------- | ------- | ------ |
| `page`  | `1`   | —     |
| `limit` | `20`  | `50` |

Empty results return `data: []` (never `null`).

---

## 22. Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1705312800
```

**429 Response:**

```json
{ "statusCode": 429, "code": "RATE_LIMITED", "message": "Too many requests.", "retryAfter": 45 }
```

| Endpoint                      | Limit | Window |
| ----------------------------- | ----- | ------ |
| `POST /auth/register`       | 3     | 1 min  |
| `POST /auth/login`          | 5     | 1 min  |
| `POST /payments/create`     | 10    | 1 min  |
| `POST /quizzes/:id/attempt` | 10    | 5 min  |
| All other                     | 100   | 1 min  |

---

## 23. Endpoint Index

### Public

| Method | Path                           | Description        |
| ------ | ------------------------------ | ------------------ |
| POST   | `/auth/register`             | Register           |
| GET    | `/auth/verify/:token`        | Verify email       |
| POST   | `/auth/login`                | Login              |
| POST   | `/auth/refresh`              | Refresh token      |
| GET    | `/courses`                   | List courses       |
| GET    | `/courses/:id`               | Course detail      |
| GET    | `/certificates/verify/:code` | Verify certificate |
| POST   | `/payments/webhook/razorpay` | Razorpay webhook   |
| GET    | `/health`                    | Health check       |

### Student

| Method | Path                          | Description               |
| ------ | ----------------------------- | ------------------------- |
| POST   | `/auth/logout`              | Logout                    |
| GET    | `/users/me`                 | Own profile               |
| PATCH  | `/users/me`                 | Update profile            |
| GET    | `/lessons/:id`              | Lesson content            |
| POST   | `/courses/:id/enroll`       | Free enrollment           |
| GET    | `/students/me/courses`      | Enrolled courses          |
| GET    | `/courses/:id/access`       | Check enrollment          |
| GET    | `/courses/:id/progress`     | Course progress           |
| POST   | `/progress/video`           | Video/recording progress  |
| POST   | `/progress/resource`        | Resource complete         |
| GET    | `/lessons/:id/quiz`         | Get quiz                  |
| POST   | `/quizzes/:id/attempt`      | Submit quiz               |
| POST   | `/payments/create`          | Initiate Razorpay payment |
| GET    | `/payments/invoice/:id`     | Invoice URL               |
| GET    | `/certificates`             | Own certificates          |
| GET    | `/courses/:id/live-classes` | Live classes              |
| GET    | `/notifications`            | Notifications             |
| PATCH  | `/notifications/read`       | Mark all read             |
| PATCH  | `/notifications/:id/read`   | Mark one read             |

### Admin

| Method | Path                            | Description                              |
| ------ | ------------------------------- | ---------------------------------------- |
| POST   | `/courses`                    | Create course                            |
| PATCH  | `/courses/:id`                | Update course                            |
| PATCH  | `/courses/:id/publish`        | Publish course                           |
| PATCH  | `/courses/:id/archive`        | Archive course                           |
| POST   | `/courses/:id/modules`        | Create module                            |
| PATCH  | `/modules/:id`                | Update module                            |
| DELETE | `/modules/:id`                | Delete module                            |
| POST   | `/modules/:id/lessons`        | Create lesson (video/recording/resource) |
| PATCH  | `/lessons/:id`                | Attach videoId or resourceUrl            |
| DELETE | `/lessons/:id`                | Delete lesson                            |
| POST   | `/videos/upload-url`          | Cloudflare Stream upload URL             |
| GET    | `/videos/:id/status`          | Video processing status                  |
| POST   | `/files/upload-url`           | R2 file upload URL                       |
| POST   | `/lessons/:id/quiz`           | Create quiz                              |
| POST   | `/quizzes/:id/questions`      | Add question                             |
| POST   | `/payments/:id/refund`        | Refund payment                           |
| POST   | `/live-classes`               | Schedule class                           |
| GET    | `/admin/live-classes`         | All live classes                         |
| PATCH  | `/live-classes/:id/recording` | Attach recording URL                     |
| POST   | `/admin/certificates/issue`   | Manual certificate                       |
| GET    | `/admin/certificates`         | All certificates                         |
| GET    | `/admin/dashboard/stats`      | Dashboard stats                          |
| GET    | `/admin/students`             | Student list                             |
| GET    | `/admin/students/:id`         | Student detail                           |
| GET    | `/admin/payments`             | Payment history                          |
| GET    | `/admin/analytics`            | Platform analytics                       |

---

*End of API Design Document v2.0*
