'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import PaymentModal from '@/components/payment/PaymentModal';
import PaymentPending from '@/components/payment/PaymentPending';
import {
  PlayCircle,
  ChevronRight,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  Infinity,
  Smartphone,
  Award,
  Zap,
  Video,
  FileText,
  Star,
  GraduationCap,
  Lock,
  Globe,
  BarChart2,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = React.use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.getCourse(courseId).then((r) => r.data),
  });

  // Auto-redirect admins to the first lesson
  React.useEffect(() => {
    if (course && user?.role === 'ADMIN') {
      const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
      if (firstLessonId) {
        router.push(`/course/${course.id}/lesson/${firstLessonId}`);
      }
    }
  }, [course, user, router]);

  // Auto-expand first module
  React.useEffect(() => {
    if (course?.modules?.[0]?.id) {
      setExpandedModules(new Set([course.modules[0].id]));
    }
  }, [course]);

  const { data: access } = useQuery({
    queryKey: ['access', courseId],
    queryFn: () =>
      user ? api.getCourseAccess(courseId).then((r) => r.data) : Promise.resolve({ hasAccess: false }),
    enabled: !!user,
  });

  const handleEnrollClick = async () => {
    if (!user) return router.push('/login');
    if (course.isFree) {
      try {
        await api.enrollFree(course.id);
        const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
        if (firstLessonId) {
          router.push(`/course/${course.id}/lesson/${firstLessonId}`);
        } else {
          router.push(`/course/${course.id}`);
        }
      } catch (err: any) {
        toast.error('Enrollment Failed', {
          description: err.response?.data?.message || 'The academic server encountered an error during enrollment.',
        });
      }
    } else {
      setShowPaymentModal(true);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const totalLessons = course?.modules?.reduce(
    (acc: number, m: any) => acc + (m.lessons?.length || 0),
    0,
  ) || 0;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-page font-sans animate-in fade-in duration-700">
        <section className="relative bg-white border-b border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
              <div className="space-y-7">
                <div className="h-4 w-32 bg-bg-subtle rounded-md animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-24 bg-bg-subtle rounded-full animate-pulse" />
                </div>
                <div className="h-12 w-3/4 bg-bg-subtle rounded-md animate-pulse" />
                <div className="h-20 w-full bg-bg-subtle rounded-md animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-bg-subtle rounded-xl animate-pulse" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="size-10 rounded-xl bg-bg-subtle animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-bg-subtle rounded-md animate-pulse" />
                    <div className="h-4 w-32 bg-bg-subtle rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="h-[400px] bg-bg-subtle rounded-2xl animate-pulse border border-border shadow-xl shadow-slate-200/80" />
              </div>
            </div>
          </div>
        </section>
        
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            <div className="space-y-12">
              <div className="h-64 bg-white rounded-2xl animate-pulse border border-border" />
              <div className="h-96 bg-white rounded-2xl animate-pulse border border-border" />
            </div>
            <div className="hidden lg:flex flex-col gap-6">
              <div className="h-64 bg-white rounded-2xl animate-pulse border border-border" />
              <div className="h-48 bg-white rounded-2xl animate-pulse border border-border" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!course) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="size-20 bg-red-50 rounded-2xl flex items-center justify-center">
          <AlertCircle className="size-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">Course not found</h2>
          <p className="text-text-secondary mt-2 max-w-sm">
            The course you&apos;re looking for might have been moved or archived.
          </p>
        </div>
        <Link
          href="/courses"
          className="mt-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          Browse Catalog <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  // ── Main Page ───────────────────────────────────────────────────────────────
  const features = [
    { icon: Infinity, label: 'Full lifetime access' },
    { icon: Smartphone, label: 'Access on mobile and TV' },
    { icon: Award, label: 'Certificate of completion' },
    { icon: Globe, label: 'Available in English' },
  ];

  const highlights = [
    { icon: BookOpen, label: `${totalLessons} Lessons`, sublabel: 'Structured curriculum' },
    { icon: Users, label: `${course._count?.enrollments || 0} Students`, sublabel: 'Active learners' },
    { icon: BarChart2, label: course.level || 'All Levels', sublabel: 'Skill requirement' },
    { icon: Clock, label: course.duration || 'Self-paced', sublabel: 'Course duration' },
  ];

  return (
    <div className="min-h-screen bg-bg-page font-sans">
      {paymentSuccessId && (
        <PaymentPending courseId={course.id} paymentId={paymentSuccessId} />
      )}
      {showPaymentModal && (
        <PaymentModal
          courseId={course.id}
          courseTitle={course.title}
          amount={course.price}
          onSuccess={(id) => { setShowPaymentModal(false); setPaymentSuccessId(id); }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-white border-b border-border overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_-10%,rgba(37,99,235,0.06),transparent)]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">

            {/* Left: Course Info */}
            <div className="space-y-7">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                <Link href="/courses" className="hover:text-primary transition-colors">Catalog</Link>
                <ChevronRight className="size-3.5" />
                <span className="text-primary">{course.category || 'Development'}</span>
              </nav>

              {/* Course Level Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                  <Layers className="size-3" />
                  {course.level || 'Beginner Friendly'}
                </span>
                {course.isFree && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Star className="size-3" />
                    Free Course
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-[1.05]">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-base lg:text-lg text-text-secondary leading-relaxed max-w-2xl">
                {course.description || 'Master the arts of modern development with our comprehensive project-based learning experience.'}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {highlights.map(({ icon: Icon, label, sublabel }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3.5 bg-bg-subtle rounded-xl border border-border"
                  >
                    <div className="size-9 rounded-lg bg-white shadow-sm border border-border flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{label}</p>
                      <p className="text-[10px] font-semibold text-text-muted">{sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 pt-1">
                <div className="size-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  {course.author?.name?.charAt(0) || 'I'}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Instructor</p>
                  <p className="text-sm font-semibold text-text-primary flex items-center gap-1">
                    {course.author?.name || 'CodeDevin Instructor'}
                    <GraduationCap className="size-3.5 text-primary" />
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Sticky Enrollment Card */}
            <div className="w-full sticky top-20">
              <div className="bg-white rounded-2xl border border-border shadow-xl shadow-slate-200/80 overflow-hidden">

                {/* Preview thumbnail */}
                <div className="aspect-video bg-bg-subtle relative group overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex flex-col items-center justify-center gap-3 text-text-muted">
                      <div className="size-16 rounded-2xl bg-white shadow-md border border-border flex items-center justify-center">
                        <Video className="size-7 text-primary" />
                      </div>
                      <p className="text-xs font-semibold">Course Preview</p>
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                    <div className="size-14 rounded-full bg-white/90 backdrop-blur shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <PlayCircle className="size-8 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-5">
                  {/* Price */}
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-black text-text-primary tracking-tight">
                      {course.isFree ? 'Free' : `₹${course.price?.toLocaleString()}`}
                    </span>
                    {!course.isFree && (
                      <span className="text-sm font-semibold text-text-muted line-through mb-1">
                        ₹{(course.price * 2)?.toLocaleString()}
                      </span>
                    )}
                    {!course.isFree && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mb-1">
                        50% OFF
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  {access?.hasAccess ? (
                    <button
                      onClick={() => {
                        const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
                        router.push(firstLessonId ? `/course/${course.id}/lesson/${firstLessonId}` : `/course/${course.id}`);
                      }}
                      className="w-full bg-text-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="size-5" />
                      Go to Classroom
                    </button>
                  ) : (
                    <button
                      onClick={handleEnrollClick}
                      className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="size-5" />
                      {course.isFree ? 'Enroll for Free' : 'Get Lifetime Access'}
                    </button>
                  )}

                  {/* Risk note */}
                  {!course.isFree && (
                    <p className="text-center text-[11px] text-text-muted font-medium">
                      30-Day Money-Back Guarantee
                    </p>
                  )}

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Includes */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                      This course includes
                    </p>
                    <ul className="space-y-2.5">
                      {features.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                          <Icon className="size-4 text-primary shrink-0" />
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Below Hero ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

          {/* Left Column: What you'll learn + Curriculum */}
          <div className="space-y-12">

            {/* What you'll learn */}
            <div className="bg-white rounded-2xl border border-border p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">What you&apos;ll learn</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(course.learningOutcomes?.length
                  ? course.learningOutcomes
                  : [
                    'Build real-world projects from scratch',
                    'Master core concepts and advanced techniques',
                    'Create a portfolio-ready project',
                    'Apply best practices used by professionals',
                  ]
                ).map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-bg-subtle border border-border/60">
                    <CheckCircle className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-text-secondary leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Course Curriculum</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                  <Layers className="size-3.5" />
                  {course.modules?.length || 0} modules · {totalLessons} lessons
                </div>
              </div>

              {/* Module Accordion */}
              <div className="space-y-2">
                {course.modules?.map((mod: any, idx: number) => {
                  const isOpen = expandedModules.has(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-sm"
                    >
                      {/* Module header */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-subtle transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-text-muted w-7 text-center">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{mod.title}</p>
                            <p className="text-[11px] font-medium text-text-muted mt-0.5">
                              {mod.lessons?.length || 0} lessons
                            </p>
                          </div>
                        </div>
                        {isOpen
                          ? <ChevronUp className="size-4 text-text-muted shrink-0" />
                          : <ChevronDown className="size-4 text-text-muted shrink-0" />
                        }
                      </button>

                      {/* Lessons list */}
                      {isOpen && (
                        <div className="border-t border-border bg-bg-subtle/40">
                          {mod.lessons?.map((lesson: any, lIdx: number) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                'flex items-center justify-between px-5 py-3.5 border-b border-border/60 last:border-b-0 hover:bg-bg-subtle transition-colors',
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="size-7 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 shadow-sm">
                                  {lesson.type === 'VIDEO'
                                    ? <Video className="size-3.5 text-primary" />
                                    : <FileText className="size-3.5 text-text-muted" />
                                  }
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-text-secondary">{lesson.title}</p>
                                  {lesson.duration && (
                                    <p className="text-[10px] font-medium text-text-muted flex items-center gap-1 mt-0.5">
                                      <Clock className="size-2.5" />
                                      {lesson.duration}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {lesson.isFree
                                ? (
                                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                                    Preview
                                  </span>
                                )
                                : (
                                  <Lock className="size-3.5 text-text-muted shrink-0" />
                                )
                              }
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: supplementary course info */}
          <div className="hidden lg:flex flex-col gap-6">

            {/* Course Statistics Card */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart2 className="size-5 text-primary" />
                </div>
                <h3 className="text-base font-black text-text-primary tracking-tight">Course Statistics</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BookOpen, label: 'Lessons', value: String(totalLessons) },
                  { icon: Users, label: 'Students Enrolled', value: String(course._count?.enrollments || 0) },
                  { icon: BarChart2, label: 'Level', value: course.level || 'All Levels' },
                  { icon: Clock, label: 'Duration', value: course.duration || 'Self-paced' },
                  { icon: Layers, label: 'Modules', value: String(course.modules?.length || 0) },
                  { icon: Globe, label: 'Language', value: 'English' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-1.5 p-3 bg-bg-subtle rounded-xl border border-border/60">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Icon className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-sm font-bold text-text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Details Card - Moved from below */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="size-5 text-primary" />
                </div>
                <h3 className="text-base font-black text-text-primary tracking-tight">Course Details</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Category', value: course.category || 'Development' },
                  { label: 'Level', value: course.level || 'All Levels' },
                  { label: 'Last Updated', value: new Date(course.updatedAt || course.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
                  { label: 'Status', value: (course.status?.charAt(0).toUpperCase() + course.status?.slice(1)) || 'Published' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                    <span className="text-xs font-semibold text-text-muted">{label}</span>
                    <span className="text-xs font-bold text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements Card */}
            {course.learningOutcomes?.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <CheckCircle className="size-5 text-amber-600" />
                  </div>
                  <h3 className="text-base font-black text-text-primary tracking-tight">Requirements</h3>
                </div>
                <ul className="space-y-2.5">
                  {(course.learningOutcomes as string[]).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <div className="size-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="size-1.5 rounded-full bg-amber-500" />
                      </div>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {/* Share Card */}
            <div className="bg-linear-to-br from-primary/8 to-primary/3 rounded-2xl border border-primary/20 p-6 space-y-3 text-center">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Globe className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary">Share this course</p>
                <p className="text-xs text-text-muted mt-0.5">Help others discover great learning</p>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: course.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link Copied', {
                      description: 'The course reference has been copied to your clipboard.',
                    });
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors"
              >
                Share Course
              </button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
