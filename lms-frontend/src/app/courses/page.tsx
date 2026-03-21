'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CourseCard } from '@/components/ui/CourseCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Courses</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Master Computer Science</h1>
          <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
            Dive into our specialized library of 170+ videos on DSA, Java, C++, and System Design. 
            Built specifically for students aspiring for top-tier engineering roles.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
                type="text"
                placeholder="Search by title, instructor, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 bg-white border border-slate-200 rounded-md py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center p-1 bg-slate-100/50 rounded-md border border-slate-200 w-full sm:w-auto">
              {(['all', 'free', 'paid'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded text-sm font-medium capitalize flex-1 sm:flex-none transition-colors",
                    filter === f
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="hidden sm:flex h-9 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md items-center justify-center text-sm font-medium gap-2">
              <SlidersHorizontal className="size-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden h-[340px] animate-pulse">
                <div className="h-40 bg-slate-100" />
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-20 bg-slate-200/60 rounded" />
                    <div className="h-3 w-16 bg-slate-200/60 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200/60 rounded w-full" />
                    <div className="h-5 bg-slate-200/60 rounded w-2/3" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="size-6 rounded-full bg-slate-200/60" />
                    <div className="h-3 w-24 bg-slate-200/60 rounded" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="h-4 w-20 bg-slate-200/60 rounded" />
                    <div className="h-4 w-12 bg-slate-200/60 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search className="size-5 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No courses found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              We couldn't find any courses matching your criteria. Try adjusting your search term or filters.
            </p>
            <button 
              className="mt-6 text-sm font-medium text-primary bg-primary/10 px-5 py-2 rounded-md hover:bg-primary/20 transition-colors"
              onClick={() => { setSearch(''); setFilter('all'); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                thumbnailUrl={course.thumbnailUrl}
                instructor={{ name: course.author?.name || 'CodeDevin Expert' }}
                lessonsCount={course._count?.lessons || 12}
                durationHours={8.5}
                price={course.price || 4999}
                isFree={course.isFree}
                rating={4.8}
                enrollments={course._count?.enrollments || 0}
                status="published"
                href={`/courses/${course.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
