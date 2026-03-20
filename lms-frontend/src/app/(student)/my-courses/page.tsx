'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Grid, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  TrendingUp,
  ArrowRight,
  Filter,
  Book,
  Layout
} from 'lucide-react';
import { CourseCard } from '@/components/ui/CourseCard';
import { Button } from '@/components/ui/Button';

const filters = [
  { id: 'all', label: 'All Courses', icon: Layout },
  { id: 'in-progress', label: 'In Progress', icon: Clock },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
];

export default function MyCoursesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: myCourses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => api.getMyCourses().then((r) => r.data),
  });

  const courses = myCourses || [];

  const filteredCourses = courses.filter((enr: any) => {
    // In a real app, we would check enr.progress or enr.status
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in-progress') return (enr.progress || 0) < 100;
    if (activeFilter === 'completed') return (enr.progress || 0) === 100;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-bg-subtle rounded-xl animate-pulse" />
            <div className="h-4 w-64 bg-bg-subtle rounded-lg animate-pulse" />
          </div>
          <div className="h-11 w-40 bg-bg-subtle rounded-xl animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex items-center gap-3 p-1 bg-bg-subtle rounded-2xl w-fit border border-border">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 w-32 bg-white/50 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Courses Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[360px] rounded-3xl bg-bg-subtle animate-pulse border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">My Courses</h1>
          <p className="text-text-secondary font-medium">Manage and track your active learning paths</p>
        </div>
        <Link href="/courses">
          <Button className="h-11 px-6 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center gap-2 group">
            <Search size={18} />
            Explore Catalog
            <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 p-1 bg-bg-subtle rounded-2xl w-fit border border-border">
        {filters.map((f) => {
          const Icon = f.icon;
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all relative whitespace-nowrap ${
                active 
                  ? 'bg-white text-primary shadow-sm border border-border/50' 
                  : 'text-text-muted hover:text-text-primary hover:bg-white/50'
              }`}
            >
              <Icon size={16} />
              {f.label}
            </button>
          );
        })}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-bg-surface rounded-[40px] border border-border border-dashed p-16 md:p-24 text-center flex flex-col items-center gap-6 shadow-sm">
          <div className="size-20 bg-bg-subtle rounded-3xl flex items-center justify-center text-text-muted shadow-inner">
            <Book size={40} />
          </div>
          <div className="max-w-sm">
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">No courses found</h3>
            <p className="text-text-secondary font-medium mt-2 leading-relaxed">
              {activeFilter === 'all'
                ? "You haven't enrolled in any courses yet. Start your journey today!"
                : `You don't have any ${activeFilter.replace('-', ' ')} courses at the moment.`}
            </p>
          </div>
          <Link href="/courses">
            <Button size="lg" className="h-14 px-10 text-sm font-bold uppercase tracking-widest shadow-2xl shadow-primary/20">
              Browse Professional Courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((enr: any) => (
            <CourseCard
              key={enr.courseId}
              id={enr.courseId}
              title={enr.course?.title}
              thumbnailUrl={enr.course?.thumbnailUrl || enr.course?.thumbnail}
              instructor={{ name: enr.course?.instructor?.name || enr.course?.author?.name || 'Academic Lead' }}
              lessonsCount={enr.course?.lessonsCount || 24}
              durationHours={12}
              progress={enr.progress || 0}
              category={enr.course?.category}
              href={`/courses/${enr.courseId}`}
              className="hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50"
            />
          ))}
        </div>
      )}
    </div>
  );
}
