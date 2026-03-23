'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Eye,
  BookOpen,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { CoursePlayerLayout } from '@/components/layout/CoursePlayerLayout';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { LessonVideoPlayer } from '@/components/course/LessonVideoPlayer';
import { LessonPdfViewer } from '@/components/course/LessonPdfViewer';
import { LessonTabs } from '@/components/course/LessonTabs';
import { Badge } from '@/components/ui/badge';

interface LessonMeta {
  lessonId: string;
  title: string;
  type: 'video' | 'recording' | 'resource' | 'pdf';
  isCompleted: boolean;
  durationSeconds?: number;
}

interface ModuleMeta {
  moduleId: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  lessons: LessonMeta[];
}

interface Progress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  modules: ModuleMeta[];
}

interface LessonDetail {
  id: string;
  title: string;
  type: string;
  videoId?: string;
  videoUrl?: string;
  resourceUrl?: string;
  description?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLessonPreviewPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const { courseId, lessonId } = params;

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseRes, progressRes] = await Promise.all([
        api.getCourse(courseId),
        api.getAdminCoursePreview(courseId),
      ]);

      const courseData = courseRes.data;
      setCourse(courseData);
      setProgress(progressRes.data);

      let foundLesson = null;
      for (const mod of courseData.modules || []) {
        const found = mod.lessons?.find((l: any) => l.id === lessonId);
        if (found) { foundLesson = found; break; }
      }

      if (foundLesson) {
        setLesson(foundLesson);
      } else {
        setError('Lesson not found in curriculum.');
      }
    } catch (err) {
      console.error('Failed to load lesson data', err);
      setError('Failed to load lesson. Ensure you are logged in as an admin.');
    } finally {
      // Subtle delay for smoother transition
      setTimeout(() => setLoading(false), 300);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLessonClick = useCallback((id: string) => {
    router.push(`/admin/courses/${courseId}/preview/lesson/${id}`);
  }, [courseId, router]);

  const handleDurationChange = (newDuration: number) => {
    const duration = Math.floor(newDuration);
    if (lesson && (!lesson.durationSeconds || lesson.durationSeconds === 0)) {
       // Update local lesson state
       setLesson(prev => prev ? { ...prev, durationSeconds: duration } : null);
       
       // Update course state to refresh sidebar
       setCourse((prevCourse: any) => {
         if (!prevCourse) return prevCourse;
         const updatedModules = prevCourse.modules?.map((mod: any) => ({
           ...mod,
           lessons: mod.lessons?.map((l: any) => 
             l.id === lessonId ? { ...l, durationSeconds: duration } : l
           )
         }));
         return { ...prevCourse, modules: updatedModules };
       });

       // Update progress state to refresh sidebar
       setProgress((prevProgress: any) => {
         if (!prevProgress) return prevProgress;
         const updatedModules = prevProgress.modules?.map((mod: any) => ({
           ...mod,
           lessons: mod.lessons?.map((l: any) => 
             l.lessonId === lessonId ? { ...l, durationSeconds: duration } : l
           )
         }));
         return { ...prevProgress, modules: updatedModules };
       });
    }
  };

  const handleNextLesson = useCallback(() => {
    if (!progress) return;

    let currentFound = false;
    for (const mod of progress.modules) {
      for (const l of mod.lessons) {
        if (currentFound) {
          router.push(`/admin/courses/${courseId}/preview/lesson/${l.lessonId}`);
          return;
        }
        if (l.lessonId === lessonId) {
          currentFound = true;
        }
      }
    }
    router.push(`/admin/courses`);
  }, [progress, lessonId, courseId, router]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sidebarModules = useMemo(() => {
    if (!progress) return [];
    return progress.modules.map(mod => ({
      id: mod.moduleId,
      title: mod.title,
      lessons: mod.lessons.map(l => {
        // Fallback to course data if durationSeconds is missing in progress meta
        const courseLesson = course?.modules?.flatMap((m: any) => m.lessons)
          .find((cl: any) => cl.id === l.lessonId);
        
        return {
          id: l.lessonId,
          title: l.title,
          duration: formatDuration(l.durationSeconds || courseLesson?.durationSeconds),
          type: (l.type === 'resource' || l.type === 'pdf' ? 'pdf' : 'video') as 'video' | 'pdf',
          completed: false,
          active: l.lessonId === lessonId,
        };
      }),
    }));
  }, [progress, course, lessonId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden font-sans">
        {/* Sidebar Skeleton */}
        <div className="w-[350px] border-r border-border bg-white p-6 space-y-6 hidden lg:block">
           <Skeleton className="h-8 w-40" />
           <Skeleton className="h-4 w-full" />
           <div className="space-y-4 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
           </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
           <Skeleton className="h-12 w-full rounded-2xl" />
           <Skeleton className="aspect-video w-full rounded-[32px]" />
           <div className="space-y-4">
              <div className="flex gap-3">
                 <Skeleton className="h-6 w-20 rounded-full" />
                 <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-2/3" />
              <div className="flex gap-4 pt-4">
                 <Skeleton className="h-10 w-24 rounded-lg" />
                 <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-bg-page text-text-muted gap-6 font-sans p-6 text-center">
        <div className="size-16 bg-error/10 text-error rounded-full flex items-center justify-center">
          <AlertCircle className="size-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Preview Unavailable</h2>
          <p className="text-sm text-text-secondary max-w-md">{error}</p>
        </div>
        <Button onClick={() => router.push('/admin/courses')} variant="outline">
          <ArrowLeft className="size-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  const normalizedType = lesson?.type?.toLowerCase();
  const isPdf = normalizedType === 'pdf';
  const isVideo = normalizedType === 'video' || normalizedType === 'recording';

  return (
    <CoursePlayerLayout
      courseTitle={course?.title}
      sidebar={
        <CourseSidebar
          progress={0}
          modules={sidebarModules}
          isAdmin={true}
          onLessonClick={handleLessonClick}
          onNextLesson={handleNextLesson}
        />
      }
    >
      <div className="space-y-6">
        {/* Admin Preview Banner */}
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <ShieldCheck className="size-4 text-amber-600 shrink-0" />
          <div className="flex items-center gap-3 flex-1">
            <p className="text-xs font-semibold text-amber-700 flex-1">
              <span className="font-black">Admin Preview Mode</span> — You are viewing this lesson as an administrator. Progress is not tracked and enrollment is not required.
            </p>
            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-100 font-black uppercase tracking-widest shrink-0">
              Preview
            </Badge>
          </div>
        </div>

        {isVideo ? (
          <LessonVideoPlayer 
            thumbnail={lesson?.thumbnailUrl || course?.thumbnailUrl}
            videoUrl={lesson?.videoUrl}
            duration={lesson?.durationSeconds}
            onPlay={() => console.log('[Admin Preview] Playing:', lesson?.title)}
            onDurationChange={handleDurationChange}
          />
        ) : isPdf ? (
          <LessonPdfViewer
            pdfUrl={lesson?.resourceUrl || ''}
            title={lesson?.title || 'Resource'}
          />
        ) : (
          <div className="aspect-video w-full bg-slate-100 rounded-[32px] flex items-center justify-center border-2 border-dashed border-border/40 font-sans">
            <div className="text-center">
              <AlertCircle className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Content Placeholder</h3>
              <p className="text-sm text-text-muted max-w-xs mx-auto mt-2">
                This lesson content type is not yet supported in the preview player.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
              {isPdf ? 'Resource' : normalizedType === 'recording' ? 'Recording' : 'Video Lesson'}
            </span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
              Lesson ID: {lesson?.id.split('-')[0]}
            </span>
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight leading-none">
            {lesson?.title}
          </h1>
        </div>

        <LessonTabs
          description={lesson?.description || course?.description || 'Admin preview of this lesson.'}
          instructor={{
            name: course?.author?.name || 'CodeDevin Expert',
            role: 'Lead Instructor',
            avatar: course?.author?.avatar || undefined,
          }}
          isPdf={isPdf}
        />

        {/* Back to admin */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/courses')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Courses
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/courses/${courseId}/preview`)}
            className="gap-2"
          >
            <BookOpen className="size-4" />
            Course Overview
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
            className="gap-2"
          >
            <Eye className="size-4" />
            Edit Curriculum
          </Button>

        </div>
      </div>
    </CoursePlayerLayout>
  );
}
