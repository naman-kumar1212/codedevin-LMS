
# Technology Stack Document

## Code Devin Solutions — Learning Management System (LMS)

**Version:** 2.0
**Status:** Phase 1 — Confirmed Technology Decisions
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

---

## Table of Contents

1. [Stack Overview](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#1-stack-overview)
2. [Decision Principles](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#2-decision-principles)
3. [Frontend Technologies](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#3-frontend-technologies)
4. [Backend Technologies](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#4-backend-technologies)
5. [Database &amp; ORM](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#5-database--orm)
6. [Infrastructure &amp; Hosting](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#6-infrastructure--hosting)
7. [External Services](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#7-external-services)
8. [Storage &amp; Media](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#8-storage--media)
9. [Background Jobs &amp; Queuing](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#9-background-jobs--queuing)
10. [Authentication &amp; Security](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#10-authentication--security)
11. [Email &amp; Notifications](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#11-email--notifications)
12. [PDF Generation](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#12-pdf-generation)
13. [Development Tooling](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#13-development-tooling)
14. [Dependency Reference](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#14-dependency-reference)
15. [Version Pinning Policy](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#15-version-pinning-policy)

---

## 1. Stack Overview

| Layer                   | Technology           | Version          |
| ----------------------- | -------------------- | ---------------- |
| Frontend Framework      | Next.js              | 14+ (App Router) |
| Frontend Language       | TypeScript           | 5+               |
| UI Component Library    | ShadCN UI            | Latest           |
| CSS Framework           | Tailwind CSS         | 3+               |
| Server State            | TanStack React Query | 5+               |
| Client State            | Zustand              | 4+               |
| Backend Framework       | NestJS               | 10+              |
| Backend Language        | TypeScript           | 5+               |
| Runtime                 | Node.js              | 20 LTS           |
| ORM                     | Prisma               | 5+               |
| Database                | PostgreSQL           | 15+              |
| Cache / Queue Broker    | Redis                | 7+               |
| Job Queue               | BullMQ               | 5+               |
| Video Hosting           | Cloudflare Stream    | —               |
| File Storage            | Cloudflare R2        | —               |
| Payment                 | Razorpay             | Latest API       |
| Live Classes            | Zoom API             | v2               |
| Email                   | Resend               | —               |
| PDF Generation          | Puppeteer + React    | —               |
| Frontend Hosting        | Vercel               | —               |
| Backend Hosting         | Railway              | —               |
| Container Runtime (Dev) | Podman               | Latest           |
| Deployment Build        | Nixpacks             | —               |

> **Stripe has been removed from the stack entirely.** Razorpay is the sole payment gateway.

---

## 2. Decision Principles

Every technology was selected against these criteria in priority order:

| Priority | Principle                                                                               |
| -------- | --------------------------------------------------------------------------------------- |
| P1       | **Maintainability**— Understandable by any Node.js engineer joining the project  |
| P2       | **Budget Constraint**— Fits within infrastructure budget for ~1,000 users Year 1 |
| P3       | **Scale Appropriateness**— Correct for 1,000 DAU; not over-engineered            |
| P4       | **Type Safety**— First-class TypeScript support throughout                       |
| P5       | **Ecosystem Cohesion**— Technologies integrate naturally with each other         |

---

## 3. Frontend Technologies

### 3.1 Next.js 14+ (App Router)

| Attribute                    | Detail                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**               | Primary frontend framework                                                                                                                                    |
| **Why selected**       | App Router provides server components, nested layouts, streaming, and built-in middleware. Route groups cleanly separate public, student, and admin surfaces. |
| **Key features used**  | App Router, Route Groups, Layouts, Middleware, Server Components,`next/font`,`next/image`                                                                 |
| **Rendering strategy** | Server Components for public/course pages. Client Components for interactive UI (player, quiz, forms).                                                        |

### 3.2 TypeScript

| Attribute               | Detail                                              |
| ----------------------- | --------------------------------------------------- |
| **Role**          | Primary language for frontend and backend           |
| **Configuration** | Strict mode enabled. Path aliases:`@/`→`src/`. |

### 3.3 Tailwind CSS

| Attribute               | Detail                                                     |
| ----------------------- | ---------------------------------------------------------- |
| **Role**          | Utility-first CSS framework                                |
| **Configuration** | Custom theme tokens for brand colours, typography, spacing |

**Theme Configuration:**

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#2563EB',
        hover: '#1D4ED8',
        light: '#DBEAFE',
      },
      background: '#F8FAFC',
      surface: '#FFFFFF',
      border: '#E5E7EB',
      text: {
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#64748B',
      },
      success: '#16A34A',
      warning: '#F59E0B',
      error: '#DC2626',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  }
}
```

### 3.4 ShadCN UI

| Attribute                | Detail                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Role**           | Component library                                                                                             |
| **Why selected**   | Components copied into project (full control). Built on Radix UI (accessible). Tailwind-native.               |
| **Key components** | Button, Dialog, Table, DropdownMenu, Select, Input, Form, Card, Badge, Progress, Tabs, Sheet, Skeleton, Toast |

### 3.5 TanStack React Query v5

| Attribute             | Detail                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Role**        | Server state management                                                                           |
| **Usage scope** | All API data: courses, lessons, quiz state, enrollment, notifications, certificates, live classes |

### 3.6 Zustand

| Attribute             | Detail                                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| **Role**        | Client-side state                                                            |
| **Usage scope** | Auth state (user, role, isAuthenticated), UI preferences, notification count |

---

## 4. Backend Technologies

### 4.1 NestJS

| Attribute              | Detail                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Role**         | Primary backend framework                                                                                    |
| **Why selected** | Enforces architectural discipline. Modules, controllers, services, guards, pipes. Prevents route-file chaos. |
| **Key features** | Modules, Controllers, Services, Guards, Interceptors, ValidationPipe, ConfigModule, ThrottlerModule          |

### 4.2 Node.js 20 LTS

| Attribute      | Detail                                                |
| -------------- | ----------------------------------------------------- |
| **Role** | Server runtime                                        |
| **Note** | Pin to Node 20 LTS. Do not use odd-numbered versions. |

### 4.3 class-validator + class-transformer

| Attribute       | Detail                                                       |
| --------------- | ------------------------------------------------------------ |
| **Role**  | DTO validation and transformation                            |
| **Usage** | Declarative decorator-based validation on all request bodies |

---

## 5. Database & ORM

### 5.1 PostgreSQL 15+

| Attribute              | Detail                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Role**         | Primary relational database                                                            |
| **Hosting**      | Railway managed PostgreSQL plugin                                                      |
| **Why selected** | Relational integrity critical for enrollments, certificates, payments. ACID compliant. |

### 5.2 Prisma ORM

| Attribute              | Detail                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| **Role**         | ORM, query builder, migration manager                                                                |
| **Why selected** | Type-safe queries from schema. Schema-first migrations. Superior TypeScript integration.             |
| **Key features** | `prisma migrate dev`,`prisma migrate deploy`,`prisma generate`, relation loading, transactions |

---

## 6. Infrastructure & Hosting

### 6.1 Vercel (Frontend)

| Attribute              | Detail                                                                |
| ---------------------- | --------------------------------------------------------------------- |
| **Role**         | Frontend deployment                                                   |
| **Why selected** | Zero-config Next.js deployment. Global CDN. Auto preview deployments. |
| **Config**       | `NEXT_PUBLIC_API_URL`points to Railway backend                      |

### 6.2 Railway (Backend + Database + Redis)

| Attribute                | Detail                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Role**           | Backend API, PostgreSQL, Redis hosting                                                                           |
| **Why selected**   | Developer-friendly PaaS. Managed database and Redis plugins. Nixpacks auto-build. Fits budget for Phase 1 scale. |
| **Services**       | NestJS API (web), BullMQ workers (worker), PostgreSQL (plugin), Redis (plugin)                                   |
| **Deploy command** | `npx prisma migrate deploy && node dist/main.js`                                                               |

### 6.3 Podman (Local Development)

| Attribute       | Detail                                           |
| --------------- | ------------------------------------------------ |
| **Role**  | Local container runtime for PostgreSQL and Redis |
| **Usage** | `podman-compose up`starts local dependencies   |

**Local compose:**

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

---

## 7. External Services

### 7.1 Cloudflare Stream

| Attribute                     | Detail                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Role**                | Video hosting, encoding, adaptive streaming, CDN delivery for all video and recording content                                                                |
| **Why selected**        | Cloudflare ecosystem aligns with R2 for storage. Adaptive bitrate streaming. Secure playback. No egress fees on R2 storage. Cost-effective at Phase 1 scale. |
| **Replaces**            | Bunny Stream (removed)                                                                                                                                       |
| **Upload method**       | Pre-signed direct upload URL — admin browser uploads directly to Cloudflare Stream                                                                          |
| **Playback method**     | Cloudflare Stream embed player via `videoId`                                                                                                               |
| **Lesson types served** | `video`lessons and `recording`lessons                                                                                                                    |
| **Key API calls**       | `POST /client/v4/accounts/{accountId}/stream/direct_upload`,`GET /client/v4/accounts/{accountId}/stream/{videoId}`                                       |
| **Data stored**         | `video_id`string only — never full URL                                                                                                                    |

### 7.2 Cloudflare R2

| Attribute                | Detail                                                                      |
| ------------------------ | --------------------------------------------------------------------------- |
| **Role**           | Object storage for thumbnails, PDFs, resource files, certificates, invoices |
| **Why selected**   | Zero egress cost. S3-compatible API. Cloudflare global network.             |
| **Integration**    | `@aws-sdk/client-s3`with custom R2 endpoint                               |
| **Content served** | Thumbnails, PDF resources, certificate PDFs, invoice PDFs                   |

### 7.3 Zoom API (v2)

| Attribute                    | Detail                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- |
| **Role**               | Auto-create scheduled Zoom meetings for live classes                        |
| **Auth method**        | Server-to-Server OAuth                                                      |
| **Key API call**       | `POST /users/me/meetings`                                                 |
| **Recording workflow** | Manual: admin downloads from Zoom dashboard, uploads to LMS via admin panel |
| **Automation**         | Recording auto-import not implemented in Phase 1                            |

### 7.4 Razorpay (Only Payment Gateway)

| Attribute               | Detail                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| **Role**          | All payment processing (INR)                                                                   |
| **Why selected**  | Industry standard for Indian payments. UPI, cards, net banking. Well-documented Node.js SDK.   |
| **Integration**   | `razorpay`npm package. Razorpay.js for frontend checkout.                                    |
| **Webhook event** | `payment.captured`                                                                           |
| **Security**      | HMAC-SHA256 signature verification on every webhook                                            |
| **Note**          | **Stripe is removed entirely.**No Stripe code, config, or references anywhere in the codebase. |

### 7.5 Resend

| Attribute                  | Detail                                                |
| -------------------------- | ----------------------------------------------------- |
| **Role**             | Transactional email delivery                          |
| **Template format**  | React Email components compiled to HTML               |
| **Async delivery**   | All sends dispatched via BullMQ email worker          |
| **Failure handling** | BullMQ retry with exponential backoff (max 3 retries) |

---

## 8. Storage & Media

### 8.1 Video Storage — Cloudflare Stream

All video content (lesson videos and live session recordings) is stored and delivered exclusively via Cloudflare Stream. The application server stores only the `video_id` string returned by Cloudflare Stream after upload.

```
Lesson record: video_id = "cf-stream-video-id-abc123"

Playback URL constructed:
https://iframe.cloudflarestream.com/{video_id}
```

### 8.2 File Storage — Cloudflare R2

Non-video assets use Cloudflare R2 via the S3-compatible API.

**Bucket structure:**

```
lms-bucket/
├── thumbnails/
│   └── {courseId}/{filename}
├── resources/
│   └── {lessonId}/{filename}
├── certificates/
│   └── {certificateCode}/{filename}.pdf
└── invoices/
    └── {paymentId}/{filename}.pdf
```

### 8.3 AWS SDK v3 (`@aws-sdk/client-s3`)

Used as the R2 client. Configured with the R2 endpoint override:

```typescript
endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
```

---

## 9. Background Jobs & Queuing

### BullMQ + Redis

| Attribute                    | Detail                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| **Role**               | Async job processing for certificate generation, email, notifications |
| **Broker**             | Redis (Railway managed)                                               |
| **NestJS integration** | `@nestjs/bullmq`                                                    |

**Queues:**

| Queue                      | Payload                                           | Worker Action                                     |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `certificate-generation` | `{ studentId, courseId }`                       | Generate PDF, upload R2, update DB, enqueue email |
| `email-dispatch`         | `{ to, subject, template, data }`               | Send via Resend                                   |
| `notifications`          | `{ userIds[], title, message, emailTemplate? }` | Create DB records, enqueue emails                 |

**Retry policy:**

```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
}
```

---

## 10. Authentication & Security

### `@nestjs/jwt` + `@nestjs/passport`

JWT token generation and validation. Two strategies: `JwtStrategy` (15m access) and `RefreshStrategy` (7d refresh).

### bcrypt

Password hashing. Salt rounds: 12.

### `@nestjs/throttler`

Rate limiting backed by Redis. Configured per-route.

### Helmet.js

HTTP security headers middleware.

---

## 11. Email & Notifications

### Resend + React Email

Templates authored as React components, compiled server-side in NestJS worker, dispatched via Resend API. All sends are async via BullMQ.

---

## 12. PDF Generation

### Puppeteer

| Attribute                | Detail                                                  |
| ------------------------ | ------------------------------------------------------- |
| **Role**           | Headless Chrome for HTML-to-PDF rendering               |
| **Usage**          | Certificate PDFs rendered from React HTML template      |
| **Railway config** | `--no-sandbox --disable-setuid-sandbox`flags required |

```typescript
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
});
```

### QR Code: `qrcode` npm package

Generates base64 PNG embedded in certificate HTML before Puppeteer renders to PDF.

---

## 13. Development Tooling

| Tool              | Role                                              |
| ----------------- | ------------------------------------------------- |
| ESLint + Prettier | Code linting and formatting                       |
| Bruno             | API testing (open-source Postman alternative)     |
| Prisma Studio     | GUI database browser (`npx prisma studio`)      |
| ngrok             | Tunnel local backend for Razorpay webhook testing |
| `.nvmrc`        | Pin Node.js version to 20                         |

---

## 14. Dependency Reference

### Backend (key dependencies)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/bullmq": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "bullmq": "^5.0.0",
    "ioredis": "^5.0.0",
    "bcrypt": "^5.1.0",
    "passport-jwt": "^4.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "helmet": "^7.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/s3-request-presigner": "^3.0.0",
    "razorpay": "^2.9.0",
    "resend": "^2.0.0",
    "puppeteer": "^21.0.0",
    "qrcode": "^1.5.0",
    "axios": "^1.6.0"
  }
}
```

> **Note:** `stripe` package is not installed and must not be added.

### Frontend (key dependencies)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-progress": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-toast": "^1.0.0"
  }
}
```

> **Note:** `stripe` (JS SDK) is not installed on the frontend.

---

## 15. Version Pinning Policy

| Rule                         | Detail                                                    |
| ---------------------------- | --------------------------------------------------------- |
| Pin major versions           | `^`prefix (allows minor/patch, not major)               |
| Never use `*`or `latest` | Causes silent breaking changes in production              |
| Lock file committed          | `package-lock.json`committed; CI uses `npm ci`        |
| Node.js version              | Pinned to 20 LTS in `.nvmrc`and Railway env             |
| Prisma versions              | Backend `prisma`and `@prisma/client`must always match |

**`.nvmrc`:**

```
20
```

**`engines` in `package.json`:**

```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

*End of Technology Stack Document v2.0*
