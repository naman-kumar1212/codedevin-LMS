# Design Reference Document
## Code Devin Solutions — Learning Management System (LMS)
**Version:** 1.0
**Status:** Phase 1 — UI/UX Design Specification
**Last Updated:** 2026
**Document Owner:** Code Devin Solutions Engineering Team

> **How to use this document:** This is the single source of truth for all visual and interaction design decisions on the platform. Every component, layout pattern, spacing rule, and state specification described here must be implemented consistently across all pages. Reference images are provided at the end of each relevant section. Engineers should not make visual decisions not described here — open a design query instead.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Colour System](#2-colour-system)
3. [Typography System](#3-typography-system)
4. [Spacing & Grid System](#4-spacing--grid-system)
5. [Elevation & Shadow System](#5-elevation--shadow-system)
6. [Iconography](#6-iconography)
7. [Component Specifications](#7-component-specifications)
8. [Layout Architecture](#8-layout-architecture)
9. [Navigation Specification](#9-navigation-specification)
10. [Page-by-Page Design Specification](#10-page-by-page-design-specification)
    - [Public: Landing Page](#101-public-landing-page)
    - [Public: Course Listing](#102-public-course-listing)
    - [Public: Course Detail](#103-public-course-detail)
    - [Auth: Login & Register](#104-auth-login--register)
    - [Student: Dashboard](#105-student-dashboard)
    - [Student: My Courses](#106-student-my-courses)
    - [Student: Course Player (Lesson View)](#107-student-course-player--lesson-view)
    - [Student: Certificates](#108-student-certificates)
    - [Student: Live Classes](#109-student-live-classes)
    - [Student: Notifications](#1010-student-notifications)
    - [Admin: Dashboard](#1011-admin-dashboard)
    - [Admin: Course List](#1012-admin-course-list)
    - [Admin: Course Builder](#1013-admin-course-builder)
    - [Admin: Students](#1014-admin-students)
    - [Admin: Student Detail](#1015-admin-student-detail)
    - [Admin: Live Classes](#1016-admin-live-classes)
    - [Admin: Payments](#1017-admin-payments)
    - [Admin: Certificates](#1018-admin-certificates)
    - [Admin: Analytics](#1019-admin-analytics)
    - [Public: Certificate Verification](#1020-public-certificate-verification)
11. [Modal & Overlay Specifications](#11-modal--overlay-specifications)
12. [Empty State Specifications](#12-empty-state-specifications)
13. [Error State Specifications](#13-error-state-specifications)
14. [Responsive Design Rules](#14-responsive-design-rules)
15. [Motion & Animation Guidelines](#15-motion--animation-guidelines)
16. [Accessibility Standards](#16-accessibility-standards)

---

## 1. Design Philosophy

### Core Aesthetic: Structured Calm

The platform must feel **professional, trustworthy, and focused**. Students spend hours inside this interface consuming learning content. The design must never compete with the content for attention.

The aesthetic is **desktop-first SaaS dashboard** — clean white surfaces, a controlled blue accent, generous whitespace, and structured information hierarchy. Inspired by the card-grid workspace patterns visible in LMS tools like Academia and Trenning (reference images), but simplified and consistent.

### Three Design Principles

**1. Content is the hero.** The video player, course content, and lesson material must always be the most prominent element on any learning page. Navigation and UI chrome must recede.

**2. Clarity over decoration.** Every visual element must earn its place by communicating something. No gradients, illustrations, or decorations unless they reduce cognitive load or communicate state.

**3. Consistent density.** Use the same information density level across equivalent pages. Admin and student dashboards both use the same card/table patterns. Status is always communicated through colour-coded badges, never through ambiguous icons alone.

### Visual Language Reference

The three attached reference images establish the visual language:

- **Image 1 (Trenning/Fikri Studio workspace):** Card grid with category pills, assigned counts, completion state, metadata row. Establishes the course card pattern and workspace header.
- **Image 2 (Academia — Course Player):** Left nav sidebar, video player in center-left, lesson list on right, tabbed resource panel. Establishes the lesson player layout.
- **Image 3 (Academia — Student Dashboard):** Top bar with greeting, course progress table, stats panel on right, recommended course cards grid, topic chips at bottom. Establishes the student dashboard layout.

---

## 2. Colour System

### Primary Palette

All colour values are defined as CSS custom properties on `:root`. Components reference token names only — never raw hex values in component code.

```css
:root {
  /* Primary Blue — buttons, active nav, progress bars, links */
  --color-primary:        #2563EB;
  --color-primary-hover:  #1D4ED8;
  --color-primary-light:  #DBEAFE;
  --color-primary-text:   #1E40AF;

  /* Backgrounds */
  --color-bg-page:        #F8FAFC;  /* outermost page background */
  --color-bg-surface:     #FFFFFF;  /* cards, modals, sidebars */
  --color-bg-subtle:      #F1F5F9;  /* table row hover, input bg */

  /* Borders */
  --color-border:         #E5E7EB;  /* standard dividers */
  --color-border-strong:  #CBD5E1;  /* focused inputs, active elements */

  /* Text */
  --color-text-primary:   #0F172A;  /* headings, labels */
  --color-text-secondary: #475569;  /* descriptions, metadata */
  --color-text-muted:     #94A3B8;  /* placeholders, timestamps */
  --color-text-disabled:  #CBD5E1;

  /* Semantic */
  --color-success:        #16A34A;
  --color-success-light:  #DCFCE7;
  --color-warning:        #D97706;
  --color-warning-light:  #FEF3C7;
  --color-error:          #DC2626;
  --color-error-light:    #FEE2E2;
  --color-info:           #0284C7;
  --color-info-light:     #E0F2FE;
}
```

### Colour Usage Rules

| Element | Colour Token | Notes |
|---|---|---|
| Primary action button (fill) | `--color-primary` | White text |
| Primary button hover | `--color-primary-hover` | |
| Secondary/outline button | `--color-bg-surface` | `--color-primary` border + text |
| Active sidebar nav item | `--color-primary-light` bg | `--color-primary` left border (3px) + icon |
| Inactive sidebar nav | `--color-bg-surface` | `--color-text-secondary` icon |
| Progress bar fill | `--color-primary` | |
| Completed lesson icon | `--color-success` | Green checkmark |
| "Free" course badge | `--color-success-light` bg | `--color-success` text |
| "Paid" course price badge | `--color-primary-light` bg | `--color-primary-text` text |
| "Draft" status badge | `--color-warning-light` bg | `--color-warning` text |
| "Published" status badge | `--color-success-light` bg | `--color-success` text |
| "Archived" status badge | `--color-bg-subtle` bg | `--color-text-muted` text |
| "Recording" lesson badge | `--color-info-light` bg | `--color-info` text |
| Page background | `--color-bg-page` | `#F8FAFC` — not pure white |
| All cards | `--color-bg-surface` | `#FFFFFF` with shadow |
| Table row hover | `--color-bg-subtle` | |
| Input border (default) | `--color-border` | |
| Input border (focused) | `--color-primary` | 2px |

### Do Not Use Primary Blue For
- Large background areas
- Text on white backgrounds (except links and active states)
- Decorative purposes without functional meaning

---

## 3. Typography System

### Font: Inter

Loaded via `next/font/google`. Applied as `font-family: 'Inter', system-ui, sans-serif` globally.

```css
/* Font weight reference */
--font-regular:  400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `text-page-title` | 28px | 600 | 1.2 | -0.02em | Page `<h1>` headers |
| `text-section-title` | 22px | 600 | 1.3 | -0.01em | Section headings inside pages |
| `text-card-title` | 18px | 600 | 1.4 | 0 | Course card titles, dialog headings |
| `text-label` | 16px | 500 | 1.5 | 0 | Nav labels, form labels, button text |
| `text-body` | 16px | 400 | 1.6 | 0 | Paragraph content, descriptions |
| `text-body-sm` | 14px | 400 | 1.5 | 0 | Secondary text, metadata, badge text |
| `text-caption` | 12px | 400 | 1.4 | 0.01em | Timestamps, helper text |
| `text-code` | 13px | 400 | 1.5 | 0.01em | Certificate codes, IDs |

### Typography Rules

- **Headings are never underlined.** Links inside body text are underlined.
- **Maximum line length:** 72 characters for body text in reading contexts (course descriptions, lesson descriptions).
- **Do not use all-caps** except for small metadata labels (e.g. "LESSON 3 OF 12") where `letter-spacing: 0.08em` is applied.
- **Colour contrast:** All body text must meet WCAG AA contrast ratio (4.5:1 minimum against its background).
- **Numbers in data tables and stat cards** use tabular-nums: `font-variant-numeric: tabular-nums`.

---

## 4. Spacing & Grid System

### Base Unit: 4px

All spacing values are multiples of 4px. Tailwind classes map directly to this system.

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `space-1` | 4px | `p-1` / `m-1` | Icon internal gaps, tight chip padding |
| `space-2` | 8px | `p-2` / `m-2` | Small component internal spacing |
| `space-3` | 12px | `p-3` / `m-3` | Between closely related elements |
| `space-4` | 16px | `p-4` / `m-4` | Standard card padding (compact) |
| `space-5` | 20px | `p-5` / `m-5` | Button horizontal padding |
| `space-6` | 24px | `p-6` / `m-6` | Standard card padding |
| `space-8` | 32px | `p-8` / `m-8` | Between sections within a page |
| `space-10` | 40px | `p-10` / `m-10` | Page content top padding |
| `space-12` | 48px | `p-12` / `m-12` | Between major page sections |

### Layout Grid

- **Sidebar width:** 240px (fixed)
- **Topbar height:** 64px (fixed)
- **Content area max-width:** 1200px (centred within content zone)
- **Content area padding:** 32px horizontal, 32px top
- **Card gap in grids:** 20px
- **Table cell padding:** 12px vertical, 16px horizontal

### Component Size Standards

| Component | Height | Notes |
|---|---|---|
| Button (default) | 40px | `rounded-lg` (8px radius) |
| Button (small) | 32px | Compact contexts (table actions) |
| Button (large CTA) | 48px | Hero sections, enrollment |
| Input field | 40px | `rounded-lg` (8px radius) |
| Select dropdown | 40px | |
| Badge / Chip | 24px | `rounded-full` |
| Sidebar nav item | 44px | |
| Table row | 56px | Min height |
| Course card | Auto | Fixed aspect thumbnail (16:9) |
| Stat card | 120px min | |
| Notification item | 72px min | |

---

## 5. Elevation & Shadow System

Cards and modals use a consistent shadow scale. Never use `box-shadow: none` on interactive cards — always use at least `shadow-sm`.

```css
/* Shadow tokens */
--shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08);
```

| Element | Shadow |
|---|---|
| Standard card | `shadow-sm` |
| Card on hover | `shadow-md` (transition 150ms ease) |
| Sidebar | `shadow-md` (right edge only) |
| Modal / Dialog | `shadow-xl` |
| Dropdown menu | `shadow-lg` |
| Topbar | `shadow-sm` (bottom edge) |
| Video player container | `shadow-lg` |

### Border Radius

| Element | Radius |
|---|---|
| Cards | 12px (`rounded-xl`) |
| Buttons | 8px (`rounded-lg`) |
| Inputs | 8px (`rounded-lg`) |
| Badges / chips | 9999px (`rounded-full`) |
| Modals | 16px (`rounded-2xl`) |
| Thumbnails | 8px top-left, 8px top-right (bottom: 0) |
| Progress bars | 9999px (`rounded-full`) |
| Video player wrapper | 12px (`rounded-xl`) |

---

## 6. Iconography

### Library: Lucide React

All icons must come from `lucide-react`. Do not mix icon libraries.

### Icon Sizes

| Context | Size | Class |
|---|---|---|
| Sidebar nav | 20px | `w-5 h-5` |
| Button icon (left) | 16px | `w-4 h-4` |
| Badge / chip icon | 14px | `w-3.5 h-3.5` |
| Stat card icon | 24px | `w-6 h-6` |
| Empty state illustration icon | 48px | `w-12 h-12` |
| Topbar (bell, search) | 20px | `w-5 h-5` |
| Table action icon button | 16px | `w-4 h-4` |

### Sidebar Icon Mapping

| Page | Icon Name | Lucide Component |
|---|---|---|
| Dashboard | grid-2x2 | `LayoutDashboard` |
| My Courses | book-open | `BookOpen` |
| Browse Courses | search | `Search` |
| Live Classes | video | `Video` |
| Certificates | award | `Award` |
| Notifications | bell | `Bell` |
| Settings | settings | `Settings` |
| Help Center | circle-help | `CircleHelp` |
| **Admin:** Courses | book | `Book` |
| **Admin:** Students | users | `Users` |
| **Admin:** Payments | credit-card | `CreditCard` |
| **Admin:** Analytics | bar-chart-2 | `BarChart2` |

### Notification Type Icons

| Type | Icon | Colour |
|---|---|---|
| enrollment | `BookOpen` | `--color-primary` |
| payment | `CreditCard` | `--color-success` |
| live_class | `Video` | `--color-warning` |
| certificate | `Award` | `--color-success` |
| account | `User` | `--color-text-secondary` |

---

## 7. Component Specifications

### 7.1 Course Card

Used in: Public course listing, Student dashboard recommended section, My Courses, Admin course list.

```
┌─────────────────────────────┐
│  [Thumbnail 16:9]           │  ← rounded-xl top, image fills area
│  ● Free or ₹999 badge       │  ← absolute top-right, pill badge
├─────────────────────────────┤
│  Course Title (18px/600)    │  ← 2-line clamp
│  Short description (14px)   │  ← 2-line clamp, text-secondary
│                             │
│  [Module count] [Lesson cnt]│  ← text-caption with icon
│  [Progress bar 4px tall]    │  ← only on enrolled cards
│                             │
│  [Enroll Now] or [Continue] │  ← full-width CTA button
└─────────────────────────────┘
```

**Card variants:**
- **Public (not enrolled):** Thumbnail + title + description + price badge + metadata + "View Course" or "Enroll Now" button
- **Enrolled (in-progress):** Thumbnail + title + progress bar + percentage + "Continue" button (primary blue)
- **Enrolled (completed):** Thumbnail + title + "Completed ✓" badge + "Review" button (outline)
- **Admin list row:** Thumbnail (40px) + title + status badge + price + enrollment count + actions

**Hover state:** `shadow-md` + subtle `translateY(-2px)` transform on the card. Transition: `all 150ms ease`.

---

### 7.2 Progress Bar

Used in: Course cards, lesson sidebar, student dashboard table, admin student detail.

```css
/* Progress bar container */
height: 6px;
border-radius: 9999px;
background: var(--color-bg-subtle); /* track */

/* Fill */
background: var(--color-primary);
border-radius: 9999px;
transition: width 300ms ease;
```

Always accompany progress bar with a text percentage label: `42%` in `text-caption` weight 500 colour `--color-text-secondary`.

---

### 7.3 Status Badge

Pill-shaped badge used for course status, lesson type, payment status.

```
[● Label]  ← coloured dot + text
```

| Variant | Background | Text | Dot |
|---|---|---|---|
| Published | `--color-success-light` | `--color-success` | `--color-success` |
| Draft | `--color-warning-light` | `--color-warning` | `--color-warning` |
| Archived | `--color-bg-subtle` | `--color-text-muted` | `--color-text-muted` |
| Free | `--color-success-light` | `--color-success` | none |
| Paid / ₹999 | `--color-primary-light` | `--color-primary-text` | none |
| Recording | `--color-info-light` | `--color-info` | `--color-info` |
| Video | `--color-bg-subtle` | `--color-text-secondary` | none |
| Completed | `--color-success-light` | `--color-success` | `--color-success` |
| In Progress | `--color-warning-light` | `--color-warning` | `--color-warning` |
| Pending | `--color-warning-light` | `--color-warning` | `--color-warning` |
| Refunded | `--color-bg-subtle` | `--color-text-muted` | none |
| Failed | `--color-error-light` | `--color-error` | `--color-error` |

---

### 7.4 Stat Card

Used in: Student dashboard (right panel), Admin dashboard row, Student detail header.

```
┌──────────────────────────────┐
│  [Icon in coloured circle]   │  ← 40px circle, icon 20px
│                              │
│  1,247                       │  ← Large number, 28px/700
│  Total Students              │  ← Label, 14px/400 text-secondary
└──────────────────────────────┘
```

Icon circle colours by stat type:
- Students / Enrollments: `--color-primary-light` bg, `--color-primary` icon
- Revenue / Payments: `#DCFCE7` bg, `--color-success` icon
- Certificates: `#FEF3C7` bg, `--color-warning` icon
- Courses: `--color-primary-light` bg, `--color-primary` icon

---

### 7.5 Notification Bell

Located in topbar (right side).

- Bell icon `w-5 h-5`, colour `--color-text-secondary`
- Unread count badge: absolute top-right of bell, `--color-error` bg, white text, `text-caption`, `rounded-full`, `min-w-[18px] h-[18px]`
- Maximum displayed: "9+" if count > 9
- On click: opens `NotificationDropdown` (see Section 11)

---

### 7.6 Avatar

Circular profile photo or initials fallback.

| Context | Size |
|---|---|
| Topbar | 36px |
| Sidebar profile mini | 32px |
| Notification item | 32px |
| Student table row | 28px |
| Admin student detail header | 64px |

Initials fallback: First letter of first name + first letter of last name, `--color-primary-light` bg, `--color-primary` text, `font-semibold`.

---

### 7.7 Data Table

Used in: Admin students, admin payments, admin certificates, student dashboard course table (Image 3).

```
┌──────────────────────────────────────────────────────────┐
│ Column Header | Column Header | Column Header | Actions  │
│ (14px/500, text-muted, uppercase, tracking-wide)         │
├──────────────────────────────────────────────────────────┤
│ Row content   │ Row content   │ Badge         │ 🔧 ↗     │  ← 56px min height
│ Row content   │ Row content   │ Progress bar  │ 🔧 ↗     │  ← hover: bg-subtle
└──────────────────────────────────────────────────────────┘
```

- **Header row:** `--color-bg-subtle` background, `border-b` in `--color-border`
- **Body rows:** `--color-bg-surface` default, `--color-bg-subtle` on hover
- **Border:** Only `border-b` on each row (no vertical column borders)
- **Action column:** Right-aligned, icon buttons with `ghost` variant
- **Pagination:** Centred below table, numbered pages with prev/next arrows

---

## 8. Layout Architecture

### 8.1 Dashboard Layout Shell

All authenticated pages (student and admin) share this shell:

```
┌────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px, fixed, full height)  │  TOPBAR (fixed, top)   │
│                                       ├────────────────────────┤
│  Logo                                 │  Page Title            │
│  ─────────                            │  Search    Bell Avatar  │
│  Nav items (44px each)                ├────────────────────────┤
│    ● Active item (blue bg+border)     │                        │
│    ○ Inactive item                    │   CONTENT AREA         │
│                                       │   (scrollable)         │
│                                       │   padding: 32px        │
│  ─────────                            │                        │
│  Settings                             │                        │
│  Help                                 │                        │
│  ─────────                            │                        │
│  User Profile mini                    │                        │
└────────────────────────────────────────────────────────────────┘
```

- Sidebar background: `--color-bg-surface` (#FFFFFF)
- Sidebar right border: 1px `--color-border`
- Topbar background: `--color-bg-surface`
- Topbar bottom border: 1px `--color-border`
- Content area background: `--color-bg-page` (#F8FAFC)

### 8.2 Lesson Player Layout

The lesson player uses a **full-window 3-column layout** — the sidebar is hidden. A back button replaces the standard navigation.

```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR: Back arrow | Course Name | Progress (x/y lessons)   │
├────────────────┬─────────────────────────────┬───────────────┤
│ LESSON         │ VIDEO PLAYER + CONTENT       │ (Optional     │
│ SIDEBAR        │                              │  Quiz Panel   │
│ (280px fixed)  │ 16:9 player                  │  or hidden    │
│                │                              │  on desktop,  │
│ Module list    │ Lesson title + description   │  shown in     │
│ with lessons   │ Resource section             │  tab below    │
│ (completion    │ Mark complete button         │  player)      │
│  checkmarks)   │                              │               │
└────────────────┴─────────────────────────────┴───────────────┘
```

### 8.3 Public Layout

```
NAVBAR (sticky top)
│ Logo | Browse Courses | [Login] [Register] │

PAGE CONTENT
(max-width: 1200px, centred)

FOOTER
│ Links | Copyright │
```

---

## 9. Navigation Specification

### 9.1 Student Sidebar

Width: 240px. Fixed. Full viewport height. `overflow-y: auto` for scroll.

**Top section:**
- Logo: "Codedevin" wordmark, 20px/700, `--color-primary`. Padding: 24px left, 20px top/bottom.
- Divider: 1px `--color-border`

**Navigation items (in order):**
1. Dashboard — `LayoutDashboard`
2. My Courses — `BookOpen`
3. Browse Courses — `Search`
4. Live Classes — `Video`
5. Certificates — `Award`
6. Notifications — `Bell` (with unread badge)

**Spacer — `flex: 1`**

**Bottom section:**
7. Settings — `Settings`
8. Help Center — `CircleHelp`
9. Divider
10. User Profile Mini (avatar + name + email in 12px muted)

**Active state:**
```css
background: var(--color-primary-light);
border-left: 3px solid var(--color-primary);
color: var(--color-primary);
/* Icon also uses --color-primary */
```

**Inactive state:**
```css
color: var(--color-text-secondary);
/* Hover: background: var(--color-bg-subtle) */
```

---

### 9.2 Admin Sidebar

Same shell as student sidebar with different nav items.

**Navigation items (in order):**
1. Dashboard — `LayoutDashboard`
2. Courses — `Book`
3. Students — `Users`
4. Live Classes — `Video`
5. Payments — `CreditCard`
6. Certificates — `Award`
7. Analytics — `BarChart2`

**Bottom:**
8. Settings — `Settings`
9. Admin profile mini with **"Admin" pill badge** in `--color-primary-light`

---

### 9.3 Topbar

**Student topbar:**
```
[Page Title (22px/600)]  [Spacer]  [Search Bar]  [Bell 🔔]  [Avatar ▾]
```

**Admin topbar:**
```
[Breadcrumb]  [Spacer]  [+ Create Course button]  [Avatar ▾]
```

Search bar: `max-width: 320px`, placeholder "Search courses, lessons...", `rounded-full` shape (pill), `--color-bg-subtle` background, `--color-border` border (1px). Focus: white background, `--color-primary` border.

Avatar dropdown menu:
- Profile
- Settings
- Divider
- Logout (red text)

---

### 9.4 Breadcrumb (Admin topbar)

```
Courses  /  Create Course
```
- Segments separated by `/` in `--color-text-muted`
- Last segment: `--color-text-primary`, 500 weight
- Previous segments: `--color-text-secondary`, link-styled on hover

---

## 10. Page-by-Page Design Specification

---

### 10.1 Public: Landing Page

**Layout:** Public navbar + page sections + footer. No sidebar.

**Section 1 — Hero**
- 2-column layout: 60% text left, 40% illustration placeholder right
- H1: "Learn In-Demand Skills. Get Certified." — 40px/700, max-width 520px
- Subtext: 18px/400, `--color-text-secondary`, max-width 460px
- CTAs: "Browse Courses" (primary blue, 48px height, `rounded-lg`) + "Watch Demo" (outline, same height)
- Minimum height: 520px. Background: `--color-bg-page` with faint blue radial gradient top-left.

**Section 2 — Stats Bar**
- 4 stats inline: "1,200+ Students", "24 Courses", "98% Completion Rate", "500+ Certificates"
- White card, `border-b border-t`, no shadow. Each stat: large number 24px/700, label 14px/400 below.

**Section 3 — Featured Courses**
- Title: "Most Popular Courses" (22px/600) + "View all" link right-aligned
- 3-column course card grid. Cards use the standard course card spec.

**Section 4 — How It Works**
- 3-step horizontal flow with numbered circles
- Steps: Browse & Enroll → Learn at Your Pace → Get Certified
- Each step: 40px numbered circle (`--color-primary`), step title 18px/600, 2-line description

**Section 5 — CTA Banner**
- Full-width, `--color-primary` background, white text
- Headline 28px/700, subtext 16px, "Get Started Free" white-fill button with `--color-primary` text

---

### 10.2 Public: Course Listing

**Layout:** Public navbar + content (max-width 1200px, centred) + footer.

**Page header:**
- "All Courses" (28px/600) + count subtitle "Showing 42 courses"

**Filter bar:**
- Segmented toggle: [All | Free | Paid] — active segment: `--color-primary` fill
- Search input (320px, pill shape)
- Right-aligned: filter bar row

**Course grid:**
- 3-column grid, `gap-5` (20px)
- Uses standard course card component

**Empty state:** Centred, open-book illustration, "No courses found" message, "Clear filters" link.

**Pagination:** Centred, numbered. `gap-2`, each page button 36×36px `rounded-lg`.

---

### 10.3 Public: Course Detail

**Layout:** Public navbar + 2-column content + footer.

**Breadcrumb:** `Home > Courses > Node.js Fundamentals` — 14px, `--color-text-muted`

**Left column (65%):**
- Course title: 28px/700
- Meta row: tags (pill badges), enrolled count, module count
- Course description: 16px body text
- Curriculum accordion:
  - Module header: `--color-bg-subtle` bg, module title 16px/600, lesson count right
  - Expanded: lesson list with lock icons, lesson type icons, duration
  - One module expanded by default

**Right column (35%, sticky):**
- White card, `shadow-md`, `rounded-xl`
- Thumbnail: 16:9, `rounded-lg`
- Price: 28px/700 or "Free" badge
- Primary CTA button (full width, 48px)
- "What's included" checklist: `Check` icons, 14px body

---

### 10.4 Auth: Login & Register

**Layout:** Full viewport centred. No sidebar, no topbar, no footer.
Background: `--color-bg-page` with very subtle blue noise/pattern.

**Card:** `max-width: 440px`, `shadow-lg`, `rounded-2xl`, `p-8 (32px)`, white background.

**Register card elements:**
1. Logo (centred, top)
2. Title "Create your account" (22px/600)
3. Subtitle (14px, muted)
4. Full Name input
5. Email input
6. Password input + show/hide toggle
7. Password strength bar (3 segments: weak/medium/strong, colours: red/amber/green)
8. Terms checkbox (14px)
9. "Create Account" button (full width, primary, 40px)
10. "Already have an account? **Log in**" (centred, 14px)

**Login card elements:**
1. Logo (centred)
2. "Welcome back" (22px/600)
3. Email input
4. Password input + show/hide toggle + "Forgot password?" right-aligned link (14px)
5. "Log In" button (full width, primary, 40px)
6. "Don't have an account? **Sign up**"

---

### 10.5 Student: Dashboard

**Reference:** Image 3 (Academia — Student Dashboard)

**Layout:** Student sidebar + topbar + content area.

**Topbar greeting:** "Welcome back, Priya 👋" (22px/600) left side.

**Section 1 — Stats row (4 cards)**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📚            │ │ ✅            │ │ 🏆            │ │ ⏱             │
│ 3             │ │ 10            │ │ 1             │ │ 24h           │
│ Courses       │ │ Lessons       │ │ Certificates  │ │ Hours Learned │
│ Enrolled      │ │ Completed     │ │ Earned        │ │               │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```
Cards: white bg, `shadow-sm`, `rounded-xl`, `p-6`. 4-column grid.

**Section 2 — Course Progress Table**
Inspired directly by Image 3 (Academia dashboard table).

Table columns: Course Name | Instructor | Progress | Level | Next Assignment | Action

- Course Name: 16px/500, `--color-text-primary`
- Instructor: avatar (28px) + name, 14px
- Progress: progress bar (120px wide, 6px tall) + percentage right label
- Level: plain text badge (Beginner / Intermediate / Advanced)
- Next Assignment: date/time, 14px, muted
- Action: gear `⚙️` icon button

White card container, `shadow-sm`, `rounded-xl`. Row hover: `--color-bg-subtle`.

**Section 3 — Continue Learning**
Horizontal scroll or 3-column grid of compact enrolled course cards showing progress.

**Section 4 — Upcoming Live Classes**
List of 2-3 upcoming sessions. Each row: date block (left, bold date + month) | session title + course badge | time + duration | "Join" button.

---

### 10.6 Student: My Courses

**Layout:** Student sidebar + topbar.

**Filter tabs:** [All | In Progress | Completed] — underline tab style, not pill.

**Course grid:** 3-column, uses standard enrolled course card variant. Shows progress bar and percentage.

**Empty state:** Open book illustration + "No courses enrolled yet." + "Browse Courses" primary button.

---

### 10.7 Student: Course Player / Lesson View

**Reference:** Image 2 (Academia — Course Player)

**Layout:** Full window. No standard sidebar. Custom 3-zone layout.

**Topbar (custom):**
```
[← Back to My Courses]  [Course Title (16px/500)]  [3 / 12 Lessons progress]
```
Border-bottom 1px `--color-border`. Height: 60px.

**Left Panel — Lesson Sidebar (280px, fixed, full height below topbar)**

Background: `--color-bg-surface`. Right border: 1px `--color-border`. Scrollable.

Top: Course title (14px/500, `--color-text-muted`). Overall progress bar (thin, 4px).

Module list (accordion):
```
▾ Module 1: Getting Started
  ✅ Lesson 1: Introduction         [0:23]   ← completed (green check)
  ✅ Lesson 2: Setup                [7:32]   ← completed
  ▶ Lesson 3: First Project        [6:34]   ← current (blue, bold)
  🔒 Lesson 4: Advanced Topics     [2:56]   ← locked (grey, lock icon)

▸ Module 2: Core Concepts (collapsed)
```

Lesson item anatomy:
- Icon left: ✅ (completed), ▶ (current, filled blue circle), ○ (upcoming), 🔒 (locked after failed quiz), 📹 (recording type)
- Lesson title (14px)
- Duration (12px, `--color-text-muted`, right-aligned)
- Recording lessons: small `📹 Recording` inline badge

Active lesson: `--color-primary-light` background, `--color-primary` left border (2px).

**Center Panel — Content (flex-1)**

Padding: 32px.

Video/Recording lessons:
```
┌─────────────────────────────────────────────────────┐
│           CLOUDFLARE STREAM PLAYER                   │  ← 16:9 aspect ratio
│           (dark background, controls at bottom)      │     rounded-xl, shadow-lg
└─────────────────────────────────────────────────────┘

Lesson Title (22px/600)                             [Recording badge if type=recording]
Lesson description (16px body)

Lesson Resources
────────────────
📄 Lesson Guide PDF         [Download ↓]
```

Recording lesson badge (below title, if type=recording):
```
[📹 Live Session Recording]  ← info badge, --color-info-light bg
```

Resource lessons:
```
📄 [Filename.pdf]     [Download ↓]
─────────────────────────────────
[✓ Mark as Complete]   ← outline button, turns green when clicked
```

**Right Column / Tab Panel — Quiz**

Shown as a collapsible right panel (320px) or as a tab below the player on smaller screens.

Quiz states (see full spec in Section 11 — Modals).

---

### 10.8 Student: Certificates

**Layout:** Student sidebar + topbar.

**Section title:** "My Certificates" (28px/600)

**Certificate card grid (2-column):**
```
┌───────────────────────────────────────────┐
│  🏆 (gold award icon, 32px)               │
│  Node.js Fundamentals (18px/600)          │
│  Issued: January 15, 2026 (14px/muted)   │
│  CDS-A1B2C3D4-E5F6G7H8-2026              │  ← monospace, 12px, muted
│                                           │
│  [Download PDF ↓]   [Verify ↗]           │  ← two outline buttons
└───────────────────────────────────────────┘
```

Cards: white, `shadow-sm`, `rounded-xl`, `p-6`.

**Empty state:** Award medal illustration + "No certificates yet." + "View My Courses" link.

---

### 10.9 Student: Live Classes

**Layout:** Student sidebar + topbar.

**Tabs:** [Upcoming | Past] — underline style.

**Upcoming session card:**
```
┌──────────────────────────────────────────────────────┐
│  [Date block]  Session Title (18px/600)              │
│  FEB            "Live Q&A — Week 2"                  │
│   10            Node.js Fundamentals badge            │
│               📅 Feb 10, 2026 · 2:00 PM · 90 min     │
│               [Join Session →]  ← primary button     │
└──────────────────────────────────────────────────────┘
```

Date block: blue square (`--color-primary`), white text. Large day number (24px/700), month abbreviation (12px/400) below.

Status badge (right of session title):
- Upcoming: `--color-warning-light` / "Scheduled"
- Live now: `--color-success-light` / "Live Now" with pulsing green dot

**Past session card:** Same layout, "Join" replaced by "Watch Recording" (outline, only if recording lesson exists) or "No recording available" (muted text).

---

### 10.10 Student: Notifications

**Layout:** Student sidebar + topbar.

**Header:** "Notifications" (28px/600) + "Mark all as read" text button (right-aligned, `--color-primary`, 14px).

**Notification list:**

Each notification item:
```
┌────────────────────────────────────────────────────────────┐
│ [Icon 36px   │ Title (16px/500, --color-text-primary)      │ ● (unread dot)
│  circle bg]  │ Message (14px, --color-text-secondary)      │
│              │ 2 hours ago (12px, --color-text-muted)      │
└────────────────────────────────────────────────────────────┘
```

Unread item: `--color-bg-page` background + left border 3px `--color-primary`.
Read item: `--color-bg-surface` background, no border.

Unread dot: 8px circle, `--color-primary`, absolute top-right of item.

---

### 10.11 Admin: Dashboard

**Layout:** Admin sidebar + admin topbar + content area.

**Section 1 — Stats row (4 cards)**
```
Total Students | Total Enrollments (Paid/Free) | Total Revenue (₹) | Certificates Issued
```
Revenue card: `--color-success` icon on `#DCFCE7` bg. Revenue in INR: "₹1,20,290" (Indian formatting).

**Section 2 — 2-column layout**

Left (65%): Recent Enrollments table
- Columns: Student Name + avatar | Course | Type badge (Paid/Free) | Date
- 5 rows max, "View All →" link bottom-right

Right (35%): Upcoming Live Classes list
- Each item: class title, course name badge, date/time, enrolled count
- "Schedule Class" button at bottom (outline)

**Section 3 — Revenue chart placeholder**
- White card, `rounded-xl`, `shadow-sm`
- Bar chart or line chart (rendered by recharts)
- Title: "Revenue Overview", subtitle: "Monthly breakdown"
- X-axis: months abbreviated, Y-axis: ₹ values

---

### 10.12 Admin: Course List

**Layout:** Admin sidebar + topbar (breadcrumb: "Courses") + content.

**Header row:** "Courses" (28px/600) + "+" "Create Course" primary button (right).

**Filter tabs:** [All | Published | Draft | Archived] — underline style.

**Table:**
| Thumbnail | Title | Status | Price | Enrollments | Created | Actions |
|---|---|---|---|---|---|---|
| 40px img | 16px/500 | badge | ₹999 or "Free" | count | date | ✏️ 🗑️ |

Row hover: `--color-bg-subtle`. Actions: icon buttons, ghost variant.

**Empty state:** Folder illustration + "No courses yet." + "Create Course" button.

---

### 10.13 Admin: Course Builder

**Layout:** Admin sidebar + topbar (breadcrumb: "Courses / Create Course").

**Stepper (top, horizontal):**
```
[1: Course Details] ──── [2: Modules & Lessons] ──── [3: Content Upload] ──── [4: Quizzes] ──── [5: Review & Publish]
     ● (active)                 ○                           ○                      ○                    ○
```
Active step: `--color-primary` circle. Completed step: `--color-success` circle with checkmark. Future: `--color-bg-subtle` circle.

**Step 1 — Course Details**

2-column layout:
- Left (60%): Title input (large, 18px), Description textarea (4 rows), Price input (₹ prefix), "Free course" checkbox
- Right (40%): Thumbnail dropzone (dashed border, upload icon, "16:9 recommended"), thumbnail preview

**Step 2 — Modules & Lessons**

Split panel:
- Left (40%): Module list. Each module: drag handle `⠿` | module title | lesson count | ✏️ 🗑️. "Add Module" button.
- Right (60%): Lesson list for selected module. Lesson type selector: [🎬 Video | 📹 Recording | 📄 Resource]. "Add Lesson" inline form.

**Lesson type selector note:** "Recording" type is labeled "Live Session Recording" in the UI to make the purpose clear to admin.

**Step 3 — Content Upload**

Grouped by module. Each lesson row:

Video/Recording:
```
[Lesson Title]   [Upload Video / Upload Recording]
                 → IDLE: dotted dropzone, drag or click
                 → UPLOADING: progress bar, percentage %
                 → PROCESSING: spinner "Processing on Cloudflare..."
                 → READY: green checkmark + video duration
                 → ERROR: red alert + "Retry"
```

Resource:
```
[Lesson Title]   [Upload File]
                 → Accepted: PDF, DOC, PPT
                 → Uploaded: filename + size + ✕ remove
```

**Step 4 — Quizzes (Optional)**

Lesson selector dropdown (top). For selected lesson:
- "Add Quiz" button
- Quiz title input + Passing score (%)
- Question list (numbered, collapsible)
- "Add Question" button → inline form with type toggle [MCQ | Short Answer]
- MCQ: 4 option inputs + radio for "correct answer"

**Step 5 — Review & Publish**

Left: Summary checklist with validation:
```
✅ Course details complete
✅ 3 modules added
✅ 12 lessons added
✅ 10 videos uploaded
⚠️  2 lessons missing video   ← amber warning
✅ 4 quizzes added
```

Right: Course preview card (thumbnail, title, price, module count).

Bottom: "Publish Course" primary button (large, 48px) + "Save as Draft" outline button.

---

### 10.14 Admin: Students

**Layout:** Admin sidebar + topbar + content.

**Header:** "Students" (28px/600) + count badge + search input (right).

**Table columns:** Avatar + Name | Email | Joined Date | Courses Enrolled | Completed | Action ("View" button)

**Row action:** "View" outline button (small, 32px) links to student detail page.

---

### 10.15 Admin: Student Detail

**Layout:** Admin sidebar + topbar (breadcrumb: "Students / Priya Sharma").

**Student header card:**
```
[Avatar 64px]  Priya Sharma (22px/600)
               priya@example.com (14px, muted)
               Joined January 1, 2026  |  [Student] badge
```
Stats row below header: 3 small stat cards (Courses Enrolled, Completed, Certificates).

**Enrolled Courses table:**
Columns: Course | Enrolled Date | Type (Paid/Free) | Progress (bar + %) | Status badge

**Certificates table:**
Columns: Course | Certificate Code (monospace) | Issued Date | Download | Actions

**Issue Certificate panel (bottom):**
White card with title "Issue Certificate Manually", course selector dropdown, "Issue Certificate" button (outline with `--color-warning` border), warning note "Bypasses completion requirements."

---

### 10.16 Admin: Live Classes

**Layout:** Admin sidebar + topbar + content.

**Header:** "Live Classes" (28px/600) + "Schedule New Class" primary button (right).

**Tabs:** [Upcoming | Past]

**Upcoming session card (full width):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  [Blue date block]  │ Session Title (18px/600)                       │
│  FEB 10             │ Node.js Fundamentals (course badge)            │
│                     │ 📅 Feb 10, 2026 · 2:00 PM · 90 min            │
│                     │ 👥 42 enrolled students                        │
│                     │ Zoom: 82345678901  [Copy Link 📋]              │
│                     │                        [Cancel ✕] outline red  │
└──────────────────────────────────────────────────────────────────────┘
```

**Past session card:** "Completed" badge. "Attach Recording" button (or "View Lesson" if already attached).

**Schedule Class Form (slide-out panel or modal):**
- Course selector
- Class title
- Date picker + time picker
- Duration (minutes)
- "Zoom meeting will be created automatically" note (muted, info icon)
- "Create & Notify Students" primary button

---

### 10.17 Admin: Payments

**Layout:** Admin sidebar + topbar + content.

**Header:** "Payments" (28px/600).

**Stats row (3 cards):** Total Revenue (₹) | Total Transactions | Refunds Issued

**Filters row:** Status toggle [All | Completed | Pending | Refunded | Failed] + date range picker.

**Table columns:** Student | Course | Razorpay Payment ID (monospace, 12px) | Amount (₹) | Status badge | Date | Actions

Actions: "View Invoice" (link icon) + "Refund" button (small, `--color-error` text, disabled if refunded).

Note: No "Gateway" column — Razorpay is the only gateway. The table does not display a gateway badge.

---

### 10.18 Admin: Certificates

**Layout:** Admin sidebar + topbar + content.

**Header:** "Certificates" (28px/600) + "Issue Manually" outline button.

**Stats row:** Total Issued | Issued This Month | Pending Generation

**Table columns:** Student + avatar | Course | Certificate Code (monospace `text-code`) | Issued Date | Download (icon link) | Verify (external icon link)

---

### 10.19 Admin: Analytics

**Layout:** Admin sidebar + topbar + content.

**Header:** "Analytics" (28px/600). Date range filter top-right.

**Row 1 — Charts (2 columns):**
- Left: Student Growth (line chart, monthly registrations)
- Right: Revenue (bar chart, monthly ₹ values, Indian rupee formatting)

**Row 2 — Charts (2 columns):**
- Left: Enrollment Breakdown (pie/donut chart: Paid vs Free)
- Right: Completion Rates (horizontal bar chart, one bar per course)

**Row 3 — Top Courses table:**
Columns: Course | Enrollments | Completion Rate | Revenue (₹)

All charts rendered via `recharts`. Primary blue for student/revenue data. Secondary colours for comparison data.

---

### 10.20 Public: Certificate Verification

**Layout:** Minimal. Public navbar (logo only) centred. No sidebar. No footer.

Background: `--color-bg-page`.

**Verification card (max-width: 600px, centred, `shadow-xl`, `rounded-2xl`, `p-10`):**

```
      [Codedevin Solutions logo]

      [Large green shield-check icon, 64px]
            or
      [Large red X icon if invalid]

   Certificate of Completion
   (14px/400, --color-text-muted, uppercase tracking)

      Priya Sharma
   (32px/700, --color-text-primary)

   has successfully completed
   (16px/400, italic, muted)

      Node.js Fundamentals
   (22px/600, --color-primary)

   Issued on: January 15, 2026
   (14px/400, muted)

   Certificate ID:
   CDS-A1B2C3D4-E5F6G7H8-2026
   (13px, monospace, muted, `text-code` token)

   [QR Code — 80×80px]      [VERIFIED ✓ badge]
```

**Invalid state:**
- Red `XCircle` icon instead of green shield
- "Certificate Not Found" heading
- "The certificate code entered is not valid or has been revoked."
- "Verify Another Certificate" link

---

## 11. Modal & Overlay Specifications

### 11.1 Enrollment Confirmation (Free Course)

- Title: "Enroll in [Course Name]"
- Body: "This course is free. You'll get instant access to all [N] lessons."
- Buttons: "Confirm Enrollment" (primary) | "Cancel" (ghost)

### 11.2 Payment Modal (Razorpay)

- Title: "Purchase [Course Name]"
- Large price display: "₹999" (28px/700)
- Razorpay logo + "Secure payment via Razorpay"
- "Proceed to Payment" primary button (full width, 48px)
- "Cancel" ghost text button
- Note: No gateway selector — Razorpay is the only option

### 11.3 Payment Pending

- Animated spinner (`--color-primary`)
- "Confirming your payment..." (18px/500)
- "Please don't close this window. This usually takes a few seconds." (14px, muted)
- Three animated dots below

### 11.4 Quiz Panel (inside lesson page)

Not a modal — rendered inline as right panel or below player on tablet/mobile.

**Idle state:**
```
Take Quiz              [Attempt 1 of 3]
──────────────────────────────────────
[Take Quiz] primary button (full width)
```

**In-progress state:**
```
Question 2 of 5
─────────────────────────────────────
What does Node.js run on?

○  V8 JavaScript Engine
○  SpiderMonkey
○  JavaScriptCore
○  Chakra

[Previous]    [Next →]
```

MCQ: `RadioGroup` with clear hit targets (44px per option). Selected option: `--color-primary-light` bg + `--color-primary` border.

Short answer: `Textarea`, min 3 rows.

Submit button appears only on last question.

**Result state (Passed):**
```
✅  Score: 75%  PASSED
────────────────────────
You scored above the passing mark of 70%.
[Next Lesson →] primary button
```

**Result state (Failed):**
```
❌  Score: 50%  FAILED
────────────────────────
Passing score is 70%. You have 1 attempt remaining.
[Retry Quiz] outline button
```

**Locked state:**
```
🔒  Quiz Locked
────────────────
You have used all 3 attempts for this quiz.
[Back to Course] ghost button
```

### 11.5 Manual Certificate Issue (Admin Modal)

- Title: "Issue Certificate Manually"
- Warning banner: amber `AlertTriangle` icon + "This bypasses completion requirements."
- Student selector (searchable dropdown)
- Course selector (dropdown, shows only published courses)
- "Issue Certificate" button (`--color-warning` border, warning text)
- "Cancel" ghost

---

## 12. Empty State Specifications

All empty states share the same structure:

```
[Illustration icon — 64px, muted colour]
[Title — 18px/600]
[Description — 14px, text-secondary, max-width 320px, centred]
[CTA Button — if applicable]
```

| Screen | Icon | Title | Description | CTA |
|---|---|---|---|---|
| My Courses | `BookOpen` | "No courses yet" | "You haven't enrolled in any courses. Start learning today." | Browse Courses |
| Certificates | `Award` | "No certificates yet" | "Complete a course to earn your first certificate." | View My Courses |
| Live Classes (student) | `Calendar` | "No upcoming classes" | "No live classes are scheduled for your enrolled courses right now." | Browse Courses |
| Notifications | `BellOff` | "You're all caught up" | "No new notifications." | — |
| Admin: Courses | `FolderOpen` | "No courses created" | "Create your first course to start selling." | Create Course |
| Admin: Students | `Users` | "No students yet" | "Students will appear here once they register." | — |
| Admin: Payments | `CreditCard` | "No transactions yet" | "Payment transactions will appear here once students enrol." | — |
| Admin: Live Classes | `VideoOff` | "No classes scheduled" | "Schedule your first live class for enrolled students." | Schedule Class |
| Admin: Certificates | `Award` | "No certificates issued" | "Certificates appear here once students complete courses." | — |

---

## 13. Error State Specifications

Inline banners shown within page content, not as modals.

| Scenario | Type | Icon | Message |
|---|---|---|---|
| Video still processing | Warning (amber) | `Clock` | "This video is still being processed. Check back in a few minutes." |
| Recording still processing | Warning (amber) | `Clock` | "This recording is still being processed. Check back in a few minutes." |
| Not enrolled | Info (blue) | `Lock` | "Enroll in this course to access lessons." + "Enroll Now" button inline |
| Quiz attempts exhausted | Error (red) | `Lock` | "You have used all 3 attempts for this quiz." |
| Payment pending | Info (blue) | Spinner | "Confirming your payment... This may take a moment." |
| Payment failed | Error (red) | `XCircle` | "Payment was not completed. Please try again." + "Retry" button |
| Zoom unavailable (admin) | Error (red) | `VideoOff` | "Failed to create Zoom meeting. Please try again." + "Retry" button |
| Certificate not found | Error (red) | `ShieldX` | "No certificate found for this verification code." |
| API error (generic) | Error (red) | `AlertCircle` | "Something went wrong. Please refresh and try again." |

Banner anatomy:
```
[Icon] [Message text]                    [Action button (optional)] [✕ dismiss]
```
Background colour: `--color-{type}-light`. Border-left: 3px `--color-{type}`. Rounded-lg. Padding: 12px 16px.

---

## 14. Responsive Design Rules

### Breakpoints

| Name | Width | Target |
|---|---|---|
| Mobile | < 768px | Phones |
| Tablet | 768px – 1023px | Tablets, small laptops |
| Desktop | ≥ 1024px | Laptops, desktop monitors |

### Sidebar Behaviour

| Breakpoint | Behaviour |
|---|---|
| Desktop (≥1024px) | Fixed visible, 240px wide |
| Tablet (768–1023px) | Hidden. Hamburger in topbar → ShadCN `Sheet` (left drawer) |
| Mobile (<768px) | Same as tablet |

Mobile topbar when sidebar is hidden:
```
[☰ Hamburger] [Logo centred] [🔔 Bell]
```

### Grid Collapse Rules

| Grid | Desktop | Tablet | Mobile |
|---|---|---|---|
| Course cards | 3 columns | 2 columns | 1 column |
| Stat cards | 4 columns | 2 columns | 2 columns |
| Admin stat cards | 4 columns | 2 columns | 1 column |
| Certificate cards | 2 columns | 1 column | 1 column |

### Lesson Player Responsive

| Breakpoint | Layout |
|---|---|
| Desktop | 3-column (sidebar + player + quiz panel) |
| Tablet | Sidebar hidden (drawer). Player full width. Quiz as tab below player. |
| Mobile | Sidebar hidden (drawer). Player full width. Lessons and quiz stacked below. |

### Table Responsive

On mobile and tablet, data tables that don't fit the viewport become horizontally scrollable inside their card container. Do not collapse tables into card stacks — horizontal scroll is simpler and more consistent.

---

## 15. Motion & Animation Guidelines

### Philosophy
Motion communicates state change — it should not be decorative. Every animation must either confirm an action, communicate a transition, or indicate loading.

### Transition Standards

```css
/* Standard interaction transition */
transition: all 150ms ease;

/* Page section reveal */
animation: fadeInUp 200ms ease forwards;

/* Sidebar drawer */
transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);

/* Progress bar fill */
transition: width 400ms ease;
```

### Specific Animations

| Element | Animation |
|---|---|
| Card hover | `translateY(-2px)` + shadow step up. 150ms ease. |
| Button hover | Background darkens (hover token). 100ms. |
| Button active/click | `scale(0.98)`. 80ms. |
| Sidebar drawer open | Slides in from left. 250ms cubic-bezier. |
| Modal open | `scale(0.97) opacity(0) → scale(1) opacity(1)`. 200ms ease. |
| Progress bar | Width transition on mount. 400ms ease. |
| Notification badge | Pop in: `scale(0) → scale(1)`. 150ms spring. |
| Page load sections | Staggered `fadeInUp` with 50ms delay increments. |
| Spinner (loading) | Continuous rotation. 700ms linear. |
| Payment pending dots | Three dots pulsing in sequence. 500ms interval. |
| Live Now badge dot | Pulse keyframe, 2s infinite. `--color-success` glow. |

### Loading States

Use `Skeleton` component (ShadCN) for all data-dependent content areas. Skeleton bg: `--color-bg-subtle`. Animate with shimmer: left-to-right gradient sweep.

Never show blank white areas while data loads. Always show skeleton placeholders.

---

## 16. Accessibility Standards

### Minimum Requirements (WCAG 2.1 AA)

| Requirement | Rule |
|---|---|
| Colour contrast — body text | ≥ 4.5:1 ratio against background |
| Colour contrast — large text (18px+) | ≥ 3:1 ratio |
| Colour contrast — UI components | ≥ 3:1 ratio (buttons, inputs, progress) |
| Focus visible | All interactive elements must show a visible focus ring |
| Keyboard navigation | All actions completable via keyboard |
| Screen reader labels | All icon-only buttons must have `aria-label` |
| Form inputs | All inputs have associated `<label>` |
| Images | All informational images have `alt` text |

### Focus Ring Style

```css
/* Applied globally */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Specific Notes

- **Progress bars:** Must include `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- **Modals:** Must trap focus. `aria-modal="true"`. First interactive element receives focus on open.
- **Video player:** Cloudflare Stream player includes its own accessible controls. Do not override with custom controls.
- **Quiz radio buttons:** Use `RadioGroup` from ShadCN (Radix UI). Keyboard-navigable with arrow keys.
- **Notification count badge:** Include `aria-label="X unread notifications"` on the bell icon button.
- **Status badges:** Do not use colour alone — always include text label alongside the coloured dot.
- **Tables:** Must include `<thead>` with `scope="col"` headers. Row actions column header: "Actions" (visually hidden).

---

*End of Design Reference Document v1.0*
