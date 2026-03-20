'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCourseLandingPreview() {
  const params = useParams<{ courseId: string }>();
  const { courseId } = params;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-admin-preview', courseId],
    queryFn: () => api.getCourse(courseId).then((r) => r.data),
  });

  // Auto-expand first module
  React.useEffect(() => {
    if (course?.modules?.[0]?.id) {
      setExpandedModules(new Set([course.modules[0].id]));
    }
  }, [course]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalLessons = course?.modules?.reduce(
    (acc: number, m: any) => acc + (m.lessons?.length || 0),
    0,
  ) || 0;

  const totalCourseSeconds = course?.modules?.reduce(
    (acc: number, m: any) => acc + (m.lessons?.reduce((lAcc: number, l: any) => lAcc + (l.durationSeconds || 0), 0) || 0),
    0,
  ) || 0;

  const totalCourseDuration = totalCourseSeconds > 0 ? formatDuration(totalCourseSeconds) : 'Self-paced';

  if (isLoading) {
    return (
      <div className="space-y-8 font-sans">
        {/* Admin Quick Action Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
               </div>
               {[1, 2, 3].map((i) => (
                 <Skeleton key={i} className="h-16 rounded-2xl w-full" />
               ))}
            </div>
          </div>
          <div className="space-y-6">
             <Skeleton className="aspect-video w-full rounded-3xl" />
             <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-8 text-center text-slate-400">
        <AlertCircle className="size-12 opacity-20" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Course not found</h2>
        <Button onClick={() => router.push('/admin/courses')} variant="outline">
          <ArrowRight className="size-4 mr-2 rotate-180" />
          Back to list
        </Button>
      </div>
    );
  }

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
    { icon: Clock, label: totalCourseDuration, sublabel: 'Total duration' },
  ];

  const handleStartPreview = () => {
    const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
    if (firstLessonId) {
      router.push(`/admin/courses/${courseId}/preview/${firstLessonId}`);
    } else {
      router.push(`/admin/courses/${courseId}/edit`);
    }
  };

  return (
    <div className="space-y-8 font-sans animate-in fade-in zoom-in-95 duration-500">
      
      {/* Admin Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Landing Page Preview</h2>
            <p className="text-sm font-medium text-slate-400">Viewing course details as seen by prospective students.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
            className="rounded-xl font-bold gap-2"
          >
            <LayoutDashboard className="size-4" />
            Edit Course
          </Button>
          <Button 
            onClick={handleStartPreview}
            className="rounded-xl font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover gap-2"
          >
            <Zap className="size-4 fill-current" />
            Start Full Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        
        {/* Main Info */}
        <div className="space-y-8">
          
          {/* Header Section */}
          <div className="space-y-6">
             <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                  {course.category || 'Professional'}
                </Badge>
                {course.isFree && (
                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-emerald-200 bg-emerald-50 text-emerald-600">
                    Free Course
                  </Badge>
                )}
             </div>
             
             <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
               {course.title}
             </h1>

             <p className="text-base text-slate-500 leading-relaxed max-w-2xl">
               {course.description || 'No description available for this course yet.'}
             </p>

             {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {highlights.map(({ icon: Icon, label, sublabel }) => (
                  <div key={label} className="p-4 bg-white rounded-2xl border border-border shadow-sm flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                       <p className="text-xs font-black text-slate-900 truncate tracking-tight">{label}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-4">
             <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Course Curriculum</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.modules?.length || 0} Modules · {totalLessons} Lessons</p>
                </div>
             </div>

             <div className="space-y-3">
                {course.modules?.map((mod: any, idx: number) => {
                  const isOpen = expandedModules.has(mod.id);
                  return (
                    <div key={mod.id} className="bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300">
                      <button 
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                      >
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-400 w-6">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{mod.title}</span>
                         </div>
                         {isOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                          {mod.lessons?.map((lesson: any) => (
                            <Link 
                               key={lesson.id}
                               href={`/admin/courses/${courseId}/preview/${lesson.id}`}
                               className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                  <div className="size-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                     {lesson.type === 'VIDEO' ? <Video className="size-3.5 text-primary" /> : <FileText className="size-3.5 text-slate-400" />}
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{lesson.title}</span>
                                     {lesson.type === 'VIDEO' && (
                                       <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                          <Clock className="size-2.5" />
                                          {formatDuration(lesson.durationSeconds)}
                                       </span>
                                     )}
                                  </div>
                               </div>
                               <ArrowRight className="size-3 text-slate-300 group-hover:text-primary transition-colors translate-x-1 opacity-0 group-hover:opacity-100" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Sidebar Card */}
        <div className="space-y-6">
           <div className="sticky top-24 bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl shadow-slate-200">
              <div className="aspect-video rounded-2xl bg-white/10 overflow-hidden relative group border border-white/10">
                 {course.thumbnailUrl && <img src={course.thumbnailUrl} className="size-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="size-16 text-white drop-shadow-2xl opacity-40 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100" />
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight">{course.isFree ? 'FREE' : `₹${course.price?.toLocaleString()}`}</span>
                    {!course.isFree && <span className="text-sm font-bold text-white/40 line-through">₹{(course.price * 2).toLocaleString()}</span>}
                 </div>

                 <Button 
                    onClick={handleStartPreview}
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 h-14 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 shadow-xl shadow-white/5 active:scale-95 transition-all"
                 >
                   Enter Preview Mode
                   <Zap className="size-4 fill-current text-amber-500" />
                 </Button>

                 <p className="text-[10px] text-center font-bold text-white/30 uppercase tracking-[0.2em]">Administrative Bypass Active</p>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-4">
                 <p className="text-[11px] font-black uppercase tracking-widest text-white/50">This Preview Includes</p>
                 <div className="space-y-3">
                    {features.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-3">
                         <div className="size-6 rounded bg-white/5 flex items-center justify-center">
                            <Icon className="size-3 text-white/70" />
                         </div>
                         <span className="text-xs font-bold text-white/80">{label}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
