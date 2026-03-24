'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { CoursePlayerLayout } from '@/components/layout/CoursePlayerLayout';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { LessonVideoPlayer } from '@/components/course/LessonVideoPlayer';
import { LessonPdfViewer } from '@/components/course/LessonPdfViewer';
import { LessonTabs } from '@/components/course/LessonTabs';
import { useAuthStore } from '@/stores/auth.store';

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

export default function LessonPlayerPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const { courseId, lessonId } = params;
  const user = useAuthStore((s) => s.user);

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Admins use the dedicated admin preview endpoint (no enrollment needed).
      // Regular students use the standard progress endpoint (requires enrollment).
      const [courseRes, progressRes] = await Promise.all([
        api.getCourse(courseId),
        isAdmin
          ? api.getAdminCoursePreview(courseId)
          : api.getCourseProgress(courseId),
      ]);

      const courseData = courseRes.data;
      setCourse(courseData);
      setProgress(progressRes.data);

      // Find the current lesson in the course curriculum
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
      setError('Failed to synchronize classroom data.');
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, isAdmin]);


  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDurationChange = (newDuration: number) => {
    if (lesson && (!lesson.durationSeconds || lesson.durationSeconds === 0)) {
       setLesson(prev => prev ? { ...prev, durationSeconds: Math.floor(newDuration) } : null);
    }
  };

  const handleNextLesson = useCallback(() => {
    if (!progress) return;
    
    let currentFound = false;
    for (const mod of progress.modules) {
      for (const l of mod.lessons) {
        if (currentFound) {
          router.push(`/course/${courseId}/lesson/${l.lessonId}`);
          return;
        }
        if (l.lessonId === lessonId) {
          currentFound = true;
        }
      }
    }
    router.push(`/course/${courseId}`);
  }, [progress, lessonId, courseId, router]);

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sidebarModules = useMemo(() => {
    if (!progress) return [];
    return progress.modules.map(mod => {
      // Find corresponding module in course data for quiz info
      const courseModule = course?.modules?.find((m: any) => m.id === mod.moduleId);

      return {
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
            completed: l.isCompleted,
            active: l.lessonId === lessonId
          };
        }),
        quiz: courseModule?.quiz ? {
          id: courseModule.quiz.id,
          title: courseModule.quiz.title,
          questions: courseModule.quiz.questions || [],
        } : undefined,
      };
    });
  }, [progress, course, lessonId]);

  // Resources tab removed — PDFs are handled as dedicated lessons

  if (loading) {
    return (
      <div className="flex h-screen bg-bg-page animate-in fade-in duration-700 font-sans">
        <div className="w-80 border-r border-border bg-bg-surface flex flex-col pt-20">
          <div className="px-6 py-4 space-y-4">
            <div className="h-4 w-3/4 bg-bg-subtle rounded animate-pulse" />
            <div className="h-2 w-full bg-bg-subtle rounded-full animate-pulse" />
          </div>
          <div className="flex-1 overflow-hidden px-6 space-y-6 pt-4">
             {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                   <div className="h-4 w-2/3 bg-bg-subtle rounded animate-pulse" />
                   {[1, 2].map(j => (
                      <div key={j} className="h-12 w-full bg-bg-subtle/50 rounded-xl animate-pulse" />
                   ))}
                </div>
             ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-20 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full p-8 space-y-8">
            <div className="aspect-video w-full bg-slate-900 rounded-[32px] animate-pulse flex items-center justify-center">
               <Loader2 className="size-8 text-white/20 animate-spin" />
            </div>
            
            <div className="space-y-4">
              <div className="h-6 w-32 bg-bg-subtle rounded-full animate-pulse" />
              <div className="h-10 w-2/3 bg-bg-subtle rounded-xl animate-pulse" />
            </div>

            <div className="space-y-6">
               <div className="flex gap-8 border-b border-border pb-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-4 w-24 bg-bg-subtle rounded animate-pulse" />)}
               </div>
               <div className="space-y-3">
                  <div className="h-4 w-full bg-bg-subtle rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-bg-subtle rounded animate-pulse" />
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-page text-text-muted gap-6 font-sans p-6 text-center">
        <div className="size-16 bg-error/10 text-error rounded-full flex items-center justify-center">
          <AlertCircle className="size-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Classroom Unavailable</h2>
          <p className="text-sm text-text-secondary max-w-md">{error}</p>
        </div>
        <Button onClick={() => router.push(`/course/${courseId}`)} variant="outline">
          Return to Course Overview
        </Button>
      </div>
    );
  }

  const normalizedType = lesson?.type?.toLowerCase();
  const isPdf = normalizedType === 'pdf';
  const isVideo = normalizedType === 'video';

  return (
    <CoursePlayerLayout 
      courseTitle={course?.title}
      sidebar={
        <CourseSidebar 
          progress={progress?.percentage || 0}
          modules={sidebarModules}
          onLessonClick={(id) => router.push(`/course/${courseId}/lesson/${id}`)}
          onQuizClick={(id) => router.push(`/course/${courseId}/quiz/${id}`)}
          onNextLesson={handleNextLesson}
        />
      }
    >
      <div className="space-y-6">
        {isVideo ? (
          <LessonVideoPlayer 
            thumbnail={lesson?.thumbnailUrl || course?.thumbnailUrl}
            videoUrl={lesson?.videoUrl}
            duration={lesson?.durationSeconds}
            onPlay={() => console.log('Playing:', lesson?.title)}
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
                <p className="text-sm text-text-muted max-w-xs mx-auto mt-2">This lesson content is not yet available in the player.</p>
             </div>
          </div>
        )}

        {/* Admin Preview Mode banner */}
        {isAdmin && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <ShieldCheck className="size-4 text-amber-600 shrink-0" />
            <p className="text-xs font-semibold text-amber-700">
              <span className="font-bold">Admin Preview Mode</span> — You are viewing this lesson as an administrator. Progress is not tracked.
            </p>
          </div>
        )}

        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                {isPdf ? 'Resource' : (lesson?.type === 'recording' ? 'Recording' : 'Video Lesson')}
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
          description={lesson?.description || course?.description || "Master this topic with our expert-led instruction."}
          instructor={{
            name: course?.author?.name || 'CodeDevin Expert',
            role: 'Lead Instructor',
            avatar: course?.author?.avatar || undefined
          }}
          isPdf={isPdf}
        />
      </div>
    </CoursePlayerLayout>
  );
}
