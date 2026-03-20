
# Frontend Architecture Document

## Code Devin Solutions — Learning Management System (LMS)

**Version:** 2.0
**Status:** Phase 1 — Production Specification
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

---

## Table of Contents

1. [Architecture Overview](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#1-architecture-overview)
2. [Project Structure](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#2-project-structure)
3. [Routing Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#3-routing-architecture)
4. [Layout System](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#4-layout-system)
5. [Authentication Middleware](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#5-authentication-middleware)
6. [Design System](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#6-design-system)
7. [Component Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#7-component-architecture)
8. [State Management Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#8-state-management-architecture)
9. [Data Fetching Architecture](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#9-data-fetching-architecture)
10. [API Client](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#10-api-client)
11. [Video Player Integration (Cloudflare Stream)](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#11-video-player-integration)
12. [Quiz State Machine](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#12-quiz-state-machine)
13. [Admin Course Builder UI](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#13-admin-course-builder-ui)
14. [Payment Flow UI (Razorpay Only)](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#14-payment-flow-ui)
15. [Notification System UI](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#15-notification-system-ui)
16. [Page Specifications](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#16-page-specifications)
17. [Error &amp; Empty State Patterns](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#17-error--empty-state-patterns)
18. [Responsive Strategy](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#18-responsive-strategy)
19. [Performance Patterns](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#19-performance-patterns)
20. [Environment Configuration](https://claude.ai/chat/dbcb01e5-80ff-4cf6-aaa1-30fe1cc1e77e#20-environment-configuration)

---

## 1. Architecture Overview

The frontend is a **Next.js 14+ App Router** application serving three surfaces:

| Surface           | Route Prefix                   | Auth Required      |
| ----------------- | ------------------------------ | ------------------ |
| Public            | `/` `/courses` `/verify` | No                 |
| Student Dashboard | `/(student)/`                | Yes (student role) |
| Admin Dashboard   | `/admin/`                    | Yes (admin role)   |

### Core Principles

* **Server Components by default.** Pages default to RSC unless requiring browser APIs or hooks.
* **Client Components at the edge.** Only interactive components (video player, quiz, forms) are `'use client'`.
* **React Query owns server state.** All API data in React Query cache. No `useState` for fetched data.
* **Zustand owns client state.** Auth state, UI preferences, notification counts.
* **Component isolation.** UI components never call the API directly. Data flows down as props.

---

## 2. Project Structure

```
lms-frontend/
│
├── app/
│   ├── layout.tsx                ← Root layout (fonts, providers)
│   ├── page.tsx                  ← Landing page
│   ├── not-found.tsx
│   ├── error.tsx
│   │
│   ├── (public)/
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── [courseId]/page.tsx
│   │   └── verify/
│   │       └── [certificateCode]/page.tsx
│   │
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── (student)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── my-courses/page.tsx
│   │   ├── course/
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx
│   │   │       └── lesson/[lessonId]/page.tsx
│   │   ├── certificates/page.tsx
│   │   ├── live-classes/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── settings/page.tsx
│   │
│   └── admin/
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── courses/
│       │   ├── page.tsx
│       │   ├── create/page.tsx
│       │   └── [courseId]/page.tsx
│       ├── students/
│       │   ├── page.tsx
│       │   └── [studentId]/page.tsx
│       ├── live-classes/page.tsx
│       ├── payments/page.tsx
│       ├── certificates/page.tsx
│       ├── analytics/page.tsx
│       └── settings/page.tsx
│
├── middleware.ts
│
├── components/
│   ├── ui/                ← ShadCN primitives
│   ├── layout/            ← Sidebars, topbars, footer
│   ├── course/            ← CourseCard, CourseGrid, CourseFilters
│   ├── lesson/            ← LessonSidebar, LessonContent, ResourceLesson
│   ├── video/             ← CloudflareStreamPlayer
│   ├── quiz/              ← QuizContainer, QuizQuestion, QuizResult
│   ├── certificate/       ← CertificateCard, CertificateVerifyCard
│   ├── payment/           ← PaymentModal, PaymentPending
│   ├── notification/      ← NotificationBell, NotificationList
│   ├── admin/             ← CourseBuilder, StudentTable, LiveClassScheduler
│   └── shared/            ← EmptyState, ErrorState, LoadingSkeleton
│
├── lib/
│   ├── api-client.ts
│   ├── query-client.ts
│   └── utils.ts
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-courses.ts
│   ├── use-enrollment.ts
│   ├── use-progress.ts
│   ├── use-quiz.ts
│   ├── use-certificates.ts
│   ├── use-payments.ts
│   ├── use-live-classes.ts
│   └── use-notifications.ts
│
├── stores/
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── notification.store.ts
│
├── types/
│   ├── api.types.ts
│   ├── course.types.ts
│   └── user.types.ts
│
└── providers/
    └── app-providers.tsx
```

---

## 3. Routing Architecture

### Route Protection Matrix

| Route Pattern                                                        | Unauthenticated | Student          | Admin                  |
| -------------------------------------------------------------------- | --------------- | ---------------- | ---------------------- |
| `/` `/courses` `/verify/*`                                     | ✅              | ✅               | ✅                     |
| `/login` `/register`                                             | ✅              | →`/dashboard` | →`/admin/dashboard` |
| `/dashboard` `/my-courses` `/course/*`                         | →`/login`    | ✅               | →`/admin/dashboard` |
| `/certificates` `/live-classes` `/notifications` `/settings` | →`/login`    | ✅               | ❌                     |
| `/admin/*`                                                         | →`/login`    | →`/dashboard` | ✅                     |

---

## 4. Layout System

### Student Sidebar Navigation

```
Dashboard
My Courses
Browse Courses
Live Classes
Certificates
Settings
```

### Admin Sidebar Navigation

```
Dashboard
Courses
  └─ Create Course (sub-item or button)
Students
Live Classes
Payments
Certificates
Analytics
Settings
```

### Student Dashboard Layout

```
StudentDashboardLayout
├── StudentSidebar (240px fixed)
│   ├── Logo
│   ├── NavItems (Dashboard, My Courses, Browse Courses,
│   │             Live Classes, Certificates, Settings)
│   └── UserProfileMini
│
├── StudentTopbar
│   ├── Page Title
│   ├── Search Bar
│   └── NotificationBell + Avatar
│
└── ContentArea
```

### Admin Dashboard Layout

```
AdminDashboardLayout
├── AdminSidebar (240px fixed)
│   ├── Logo + "Admin" badge
│   ├── NavItems (Dashboard, Courses, Students, Live Classes,
│   │             Payments, Certificates, Analytics, Settings)
│   └── AdminProfile
│
├── AdminTopbar (breadcrumb + quick actions)
└── ContentArea
```

---

## 5. Authentication Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/', '/courses', '/login', '/register', '/verify-email', '/verify'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some(p =>
    pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isPublicPath) return NextResponse.next();

  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/my-courses') ||
         pathname.startsWith('/course') || pathname.startsWith('/certificates') ||
         pathname.startsWith('/live-classes') || pathname.startsWith('/notifications')) &&
        role !== 'student') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && token) {
      return NextResponse.redirect(
        new URL(role === 'admin' ? '/admin/dashboard' : '/dashboard', request.url)
      );
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 6. Design System

### Colour Tokens

| Token              | Hex         | Usage                              |
| ------------------ | ----------- | ---------------------------------- |
| `primary`        | `#2563EB` | Buttons, active nav, progress bars |
| `primary-hover`  | `#1D4ED8` | Hover states                       |
| `primary-light`  | `#DBEAFE` | Badges, highlights                 |
| `background`     | `#F8FAFC` | Page background                    |
| `surface`        | `#FFFFFF` | Cards                              |
| `border`         | `#E5E7EB` | Dividers                           |
| `text-primary`   | `#0F172A` | Headings                           |
| `text-secondary` | `#475569` | Descriptions                       |
| `success`        | `#16A34A` | Completed, passed                  |
| `warning`        | `#F59E0B` | Pending, in-progress               |
| `error`          | `#DC2626` | Errors, failed                     |

### Typography (Inter font)

| Element       | Size | Weight |
| ------------- | ---- | ------ |
| Page Title    | 28px | 600    |
| Section Title | 22px | 600    |
| Card Title    | 18px | 600    |
| Body          | 16px | 400    |
| Secondary     | 14px | 400    |
| Caption       | 12px | 400    |

---

## 7. Component Architecture

### Key Components

```
components/
│
├── video/
│   └── CloudflareStreamPlayer.tsx   ← 'use client' — CF Stream embed + progress
│
├── lesson/
│   ├── LessonSidebar.tsx            ← Module tree with completion state
│   ├── LessonContent.tsx            ← Routes to player or resource based on type
│   └── ResourceLesson.tsx           ← PDF download + Mark Complete button
│
├── quiz/
│   ├── QuizContainer.tsx            ← 'use client' — quiz state machine
│   ├── QuizQuestion.tsx
│   ├── QuizResult.tsx
│   └── QuizLocked.tsx
│
├── payment/
│   ├── PaymentModal.tsx             ← 'use client' — Razorpay only
│   └── PaymentPending.tsx           ← Polling state
│
└── admin/
    └── CourseBuilder/
        ├── CourseBuilderStepper.tsx
        ├── CourseDetailsForm.tsx
        ├── ModuleEditor.tsx
        ├── LessonEditor.tsx         ← type selector: video | recording | resource
        ├── VideoUploader.tsx        ← Used for both video and recording upload
        └── QuizBuilder.tsx
```

### Lesson Content Routing by Type

```typescript
// components/lesson/LessonContent.tsx
export function LessonContent({ lesson, studentId }) {
  // video and recording use identical player — type is only semantic
  if (lesson.type === 'video' || lesson.type === 'recording') {
    return (
      <CloudflareStreamPlayer
        videoId={lesson.videoId}
        lessonId={lesson.id}
        lessonType={lesson.type}  // passed for analytics/label only
      />
    );
  }
  if (lesson.type === 'resource') {
    return <ResourceLesson lesson={lesson} />;
  }
  return null;
}
```

---

## 8. State Management Architecture

### Zustand Stores

```typescript
// stores/auth.store.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  role: 'admin' | 'student' | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

// stores/ui.store.ts
interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

// stores/notification.store.ts
interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}
```

### What Goes Where

| State                     | Store                         | Examples                           |
| ------------------------- | ----------------------------- | ---------------------------------- |
| Current user + role       | Zustand `authStore`         | `user.name`,`user.role`        |
| Sidebar open/closed       | Zustand `uiStore`           | `sidebarCollapsed`               |
| Unread notification count | Zustand `notificationStore` | `unreadCount`                    |
| Course list, lesson data  | React Query                   | `useCourses()`,`useCourse(id)` |
| Enrollment status         | React Query                   | `useEnrollmentStatus(courseId)`  |
| Payment status            | React Query                   | `usePaymentStatus()`             |
| Local form / step state   | `useState`(local)           | Step index, input values           |
| Video progress            | `useRef`(local)             | `watchedPercentage`              |

---

## 9. Data Fetching Architecture

```typescript
// lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});
```

### Stale Time by Resource

| Resource        | Stale Time       | Rationale               |
| --------------- | ---------------- | ----------------------- |
| Course listing  | 5 minutes        | Infrequently updated    |
| Lesson progress | 0 (always fresh) | Critical for completion |
| Quiz attempts   | 0 (always fresh) | Attempt limits critical |
| Notifications   | 30 seconds       | Near-real-time feel     |
| Payment status  | 0 (always fresh) | Cannot show stale state |
| Certificates    | 5 minutes        | Stable once issued      |

---

## 10. API Client

```typescript
// lib/api-client.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Refresh token interceptor with concurrent request queuing
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        failedQueue.forEach(p => p.resolve());
        failedQueue = [];
        return api(original);
      } catch (refreshError) {
        failedQueue.forEach(p => p.reject(refreshError));
        failedQueue = [];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 11. Video Player Integration

### Cloudflare Stream Player

Both `video` and `recording` lesson types use the identical `CloudflareStreamPlayer` component. The `videoId` is the Cloudflare Stream UID stored in `lessons.video_id`.

```typescript
// components/video/CloudflareStreamPlayer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface CloudflareStreamPlayerProps {
  videoId: string;
  lessonId: string;
  lessonType: 'video' | 'recording';
  onComplete?: () => void;
}

export function CloudflareStreamPlayer({
  videoId,
  lessonId,
  lessonType,
  onComplete,
}: CloudflareStreamPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasMarkedComplete = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const { mutate: submitProgress } = useVideoProgress();

  // Cloudflare Stream embed URL
  const playerUrl = `https://iframe.cloudflarestream.com/${videoId}?` +
    `preload=auto&controls=true`;

  useEffect(() => {
    // Cloudflare Stream sends postMessage events from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://iframe.cloudflarestream.com') return;

      const { event: eventName, percent } = event.data ?? {};

      if (eventName === 'timeupdate' && percent !== undefined) {
        const percentage = percent * 100;
        if (percentage >= 80 && !hasMarkedComplete.current) {
          hasMarkedComplete.current = true;
          submitProgress(
            { lessonId, watchedPercentage: percentage },
            { onSuccess: () => onComplete?.() }
          );
        }
      }

      if (eventName === 'streamReady') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lessonId, submitProgress, onComplete]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {lessonType === 'recording' && (
        <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
          📹 Live Session Recording
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={playerUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title={lessonType === 'recording' ? 'Live Session Recording' : 'Course Video'}
      />
    </div>
  );
}
```

---

## 12. Quiz State Machine

```
IDLE
 │ User clicks "Take Quiz"
 ▼
LOADING
 │
 ├── attempts >= 3 ──▶ LOCKED
 └── attempts < 3
          │
          ▼
       IN_PROGRESS
          │ User submits
          ▼
       SUBMITTING
          │
          ├── passed ──▶ PASSED (lesson marks complete)
          └── failed ──▶ FAILED (can retry if attempts < 3)
```

---

## 13. Admin Course Builder UI

Multi-step flow. All steps save to API before the next step is accessible.

```
Step 1: Course Details
├── Title, Description, Price
├── Free/Paid toggle
├── Thumbnail upload (→ Cloudflare R2)
└── [Save & Continue]

Step 2: Modules & Lessons
├── Module list (draggable, reorderable)
├── Per module: lesson list
├── Lesson type selector: [Video | Recording | Resource]
│   ↑ "Recording" is shown as a distinct type for live session uploads
└── [Save & Continue]

Step 3: Content Upload
├── For video lessons: VideoUploader → Cloudflare Stream
├── For recording lessons: VideoUploader → Cloudflare Stream
│   (same uploader component — only label differs)
├── For resource lessons: FileUploader → Cloudflare R2
└── [Save & Continue]

Step 4: Quizzes (Optional)
└── [Save & Continue]

Step 5: Review & Publish
```

### VideoUploader (Used for Both Video and Recording)

```typescript
// components/admin/CourseBuilder/VideoUploader.tsx
'use client';

type UploadState = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

export function VideoUploader({ lessonId, lessonType, onVideoReady }) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (file: File) => {
    setState('uploading');

    // Get Cloudflare Stream direct upload URL
    const { data: { uploadUrl, videoId } } =
      await api.post('/videos/upload-url', { filename: file.name });

    // Upload directly to Cloudflare Stream
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => {
        setProgress(Math.round((e.loaded / (e.total ?? 1)) * 100));
      }
    });

    setState('processing');

    // Poll for Cloudflare Stream processing
    const interval = setInterval(async () => {
      const { data } = await api.get(`/videos/${videoId}/status`);
      if (data.readyToStream) {
        clearInterval(interval);
        await api.patch(`/lessons/${lessonId}`, { videoId });
        setState('ready');
        onVideoReady(videoId);
      }
    }, 3000);
  };

  const label = lessonType === 'recording'
    ? 'Upload Live Session Recording'
    : 'Upload Video';

  return (
    <div>
      {state === 'idle' && <DropZone onFileSelect={handleFileSelect} label={label} />}
      {state === 'uploading' && <ProgressBar value={progress} label={`Uploading ${progress}%`} />}
      {state === 'processing' && <StatusIndicator label="Processing video on Cloudflare..." spinning />}
      {state === 'ready' && <StatusIndicator label="Video ready ✓" success />}
      {state === 'error' && <ErrorMessage onRetry={() => setState('idle')} />}
    </div>
  );
}
```

---

## 14. Payment Flow UI (Razorpay Only)

No gateway selection UI — Razorpay is the only gateway.

### Paid Course Enrollment

```
Student clicks "Buy Now — ₹999"
    │
    ▼
ConfirmDialog: "Purchase Node.js Fundamentals for ₹999?"
    │ Confirm
    ▼
POST /payments/create { courseId }
    │
Backend returns { orderId, amount, keyId }
    │
Frontend opens Razorpay.js checkout modal
    │
Student pays
    │
PaymentPending screen (polling GET /courses/:id/access every 3s)
    │
├── Enrollment found → redirect to /course/:id + success toast
└── Timeout (30s) → "Payment confirmation taking longer than expected.
                      Check My Courses or contact support."
```

```typescript
// components/payment/PaymentModal.tsx
'use client';

export function PaymentModal({ course, onClose }) {
  const [state, setState] = useState<'confirm' | 'processing' | 'pending'>('confirm');

  const handlePay = async () => {
    setState('processing');
    const { data } = await api.post('/payments/create', { courseId: course.id });

    const rzp = new (window as any).Razorpay({
      key: data.keyId,
      order_id: data.orderId,
      amount: data.amount,
      currency: data.currency,
      name: 'Code Devin Solutions',
      description: course.title,
      handler: () => setState('pending'),
      modal: { ondismiss: () => setState('confirm') }
    });
    rzp.open();
  };

  if (state === 'pending') return <PaymentPending courseId={course.id} />;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <h2>Purchase {course.title}</h2>
        <p className="text-2xl font-bold">₹{course.price / 100}</p>
        <Button onClick={handlePay} disabled={state === 'processing'}>
          {state === 'processing' ? 'Opening checkout...' : 'Pay with Razorpay'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 15. Notification System UI

### Notification Type Icons

| Type            | Icon           | Colour             |
| --------------- | -------------- | ------------------ |
| `enrollment`  | `BookOpen`   | `primary`        |
| `payment`     | `CreditCard` | `success`        |
| `live_class`  | `Video`      | `warning`        |
| `certificate` | `Award`      | `success`        |
| `account`     | `User`       | `text-secondary` |

Notification bell polls every 30 seconds for unread count.

---

## 16. Page Specifications

### Student: Lesson Player (`/course/:courseId/lesson/:lessonId`)

3-column layout. No sidebar.

```
Left Panel (280px):
- Course title + overall progress bar
- Module accordion with completion icons
- lesson.type === 'recording' shows a 📹 icon

Center Panel:
- CloudflareStreamPlayer (for video and recording)
  OR ResourceLesson (for resource)
- Lesson title + description
- "Live Session Recording" label badge (if type === 'recording')

Right Panel / Tab:
- QuizContainer (if quiz exists)
```

### Admin: Create Course (`/admin/courses/create`)

5-step builder. Step 2 lesson type selector includes `Recording` as a distinct option to distinguish live session recordings from regular videos.

### Admin: Analytics (`/admin/analytics`)

New page added in v2.0 navigation.

Content:

* Student growth chart (registrations over time)
* Revenue chart (Razorpay transactions over time)
* Enrollment breakdown (free vs paid)
* Top courses by enrollment
* Completion rate per course

---

## 17. Error & Empty State Patterns

| Scenario                | Display                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| Video processing        | Amber banner: "Video still processing. Check back in a few minutes." |
| Quiz attempts exhausted | `QuizLocked`component: "You have used all 3 attempts."             |
| Not enrolled            | Blue info banner + "Enroll Now" button                               |
| Payment pending         | Spinner + "Confirming your payment..."                               |
| Payment failed          | Red banner + "Try Again" button                                      |
| No courses enrolled     | Illustration + "Browse Courses" button                               |
| No certificates         | Illustration + "View My Courses" button                              |
| No live classes         | Calendar illustration + "Check back soon"                            |
| Admin no courses        | Illustration + "Create Course" button                                |

---

## 18. Responsive Strategy

| Component             | Mobile                | Tablet                            | Desktop        |
| --------------------- | --------------------- | --------------------------------- | -------------- |
| Student/Admin Sidebar | Hidden (Sheet drawer) | Hidden (Sheet drawer)             | Fixed 240px    |
| Course grid           | 1 column              | 2 columns                         | 3–4 columns   |
| Lesson page           | Stacked               | Player full-width, sidebar toggle | 3-column split |
| Admin tables          | Scrollable cards      | Scrollable table                  | Full table     |

---

## 19. Performance Patterns

* **Server Components** for public/course pages (SEO + no JS bundle)
* **Lazy loading** for `CloudflareStreamPlayer` and `QuizContainer`
* **`next/image`** for all thumbnails (WebP + lazy)
* **Pagination** on all list endpoints (20 items default)
* **Suspense boundaries** via `loading.tsx` per route segment

```typescript
const CloudflareStreamPlayer = dynamic(
  () => import('@/components/video/CloudflareStreamPlayer'),
  {
    loading: () => <Skeleton className="w-full aspect-video rounded-lg" />,
    ssr: false,
  }
);
```

---

## 20. Environment Configuration

```env
# .env.local

NEXT_PUBLIC_API_URL=http://localhost:3001

# Razorpay (public key only — safe to expose to browser)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# Cloudflare Stream (account ID for embed URL construction)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-cf-account-id
```

### Rules

| Rule                   | Detail                                                       |
| ---------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_`prefix | Required for browser-accessible variables                    |
| Razorpay               | Only public `key_id`exposed — secret key stays on backend |
| Cloudflare Stream      | Account ID needed for embed URL; API token stays on backend  |
| No Stripe variables    | Stripe is not implemented — no Stripe keys anywhere         |
| Secrets                | JWT secret, Razorpay secret, R2 keys never in frontend env   |

---

*End of Frontend Architecture Document v2.0*
