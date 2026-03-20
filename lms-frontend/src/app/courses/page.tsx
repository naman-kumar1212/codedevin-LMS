'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CourseCard } from '@/components/ui/CourseCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CoursesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', search, filter],
    queryFn: () =>
      api
        .getCourses({ search: search || undefined, type: filter === 'all' ? undefined : filter })
        .then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-bg-page py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-3 tracking-tight">Master Computer Science</h1>
          <p className="text-text-secondary max-w-2xl text-lg">
            Dive into our specialized library of 170+ videos on DSA, Java, C++, and System Design. 
            Built specifically for students aspiring for top-tier engineering roles.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-end">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by title, instructor, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 text-base"
              leftIcon={<Search className="size-5 text-text-muted" />}
            />
          </div>
          <div className="flex items-center gap-3 bg-bg-surface p-1.5 rounded-xl border border-border shadow-sm">
            {(['all', 'free', 'paid'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
                  filter === f
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-subtle'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="lg" className="h-12 gap-2 text-sm font-bold uppercase tracking-widest hidden lg:flex">
            <SlidersHorizontal size={18} />
            More Filters
          </Button>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden h-[420px] animate-pulse shadow-sm">
                <div className="h-48 bg-slate-50" />
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-slate-100 rounded-lg w-full" />
                    <div className="h-6 bg-slate-100 rounded-lg w-2/3" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-8 rounded-full bg-slate-50" />
                    <div className="h-3 w-32 bg-slate-50 rounded" />
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-50 rounded" />
                    <div className="h-4 w-16 bg-slate-50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 bg-bg-surface rounded-3xl border border-border border-dashed">
            <div className="size-20 bg-bg-subtle rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="size-10 text-text-muted opacity-20" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">No courses found</h3>
            <p className="text-text-secondary max-w-sm mx-auto">
              We couldn't find any courses matching your criteria. Try adjusting your search term or filters.
            </p>
            <Button 
              variant="outline" 
              className="mt-8"
              onClick={() => { setSearch(''); setFilter('all'); }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <CourseCard
                key={course.id}
                title={course.title}
                thumbnail={course.thumbnailUrl}
                instructor={course.author?.name || 'CodeDevin Expert'}
                lessonsCount={course._count?.lessons || 12}
                duration={course.duration || '8.5 hours'}
                price={course.isFree ? 'Free' : `₹${course.price || 4999}`}
                rating={4.8}
                studentsCount={course._count?.enrollments || 0}
                status={course.isFree ? 'published' : 'published'}
                onClick={() => router.push(`/courses/${course.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
