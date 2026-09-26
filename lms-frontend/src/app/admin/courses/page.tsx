'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import { useState } from 'react';
import {
  PlusCircle,
  Search,
  BookOpen,
  Edit3,
  Archive,
  Rocket,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Book,
  Tag,
  Eye,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Users
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { getThumbnailUrl } from '@/lib/image-utils';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<any>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => api.adminCourses().then((r) => r.data),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.publishCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.archiveCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setCourseToDelete(null);
    },
  });

  const filteredCourses = courses?.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: courses?.length || 0,
    published: courses?.filter((c: any) => c.status === 'PUBLISHED').length || 0,
    enrollments: courses?.reduce((acc: number, c: any) => acc + (c._count?.enrollments || 0), 0) || 0,
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-100 rounded-md" />
            <div className="h-4 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-100 rounded-md" />
          ))}
        </div>
        <div className="h-16 w-full bg-slate-100 rounded-md" />
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <div className="h-12 bg-slate-50 border-b border-slate-200" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-white border-b border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-16 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-slate-500 mt-1 text-sm max-w-xl">
            Manage your educational portfolio and track engagement metrics.
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="h-9 px-4 rounded-md text-sm font-medium shadow-sm gap-2">
            <PlusCircle className="size-4" />
            Add Course
          </Button>
        </Link>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Courses"
          value={stats.total}
          icon={Layers}
          description="Total number of courses in the platform."
          trend="neutral"
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon={CheckCircle2}
          change={`${stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%`}
          trend="up"
          description="Courses currently visible to students."
        />
        <StatCard
          title="Total Enrollments"
          value={stats.enrollments}
          icon={Users}
          description="Cumulative student enrollments."
          trend="up"
        />
      </div>

      {/* Controls */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-slate-200 rounded-md py-2 pl-9 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-primary/50 transition-colors h-9 shadow-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-md border border-slate-200">
          {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium",
                filter === f
                  ? "bg-white text-primary shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Registry */}
      {filteredCourses && filteredCourses.length === 0 ? (
        <div className="bg-white rounded-md border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No courses found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            No courses match the search "{search}". Try adjusting your filters or search terms.
          </p>
          <Button
            variant="outline"
            onClick={() => { setSearch(''); setFilter('ALL'); }}
            className="mt-6 text-sm"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <DataTable
          data={filteredCourses || []}
          columns={[
            {
              header: "Course",
              cell: (course: any) => (
                <div className="flex items-center gap-4 group/item">
                  <div className="size-12 rounded-md bg-slate-50 overflow-hidden border border-slate-200 shrink-0">
                    {course.thumbnailUrl ? (
                      <img src={getThumbnailUrl(course.thumbnailUrl)} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-slate-400">
                        <Book className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/courses/${course.id}/preview`}
                      className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors block mb-0.5 truncate max-w-[320px]"
                    >
                      {course.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-slate-100 border-transparent text-[10px] font-medium text-slate-600 px-1.5 py-0 rounded">
                        {course.category || 'General'}
                      </Badge>
                      <span className="size-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-500">
                        {course._count?.modules || 0} Modules
                      </span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: "Learners",
              className: "text-center",
              cell: (course: any) => (
                <div className="flex justify-center">
                  <div className="flex items-center gap-1.5 px-2 py-0.5">
                    <Users className="size-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{course._count?.enrollments || 0}</span>
                  </div>
                </div>
              )
            },
            {
              header: "Status",
              className: "text-center",
              cell: (course: any) => (
                <div className="flex justify-center">
                  <StatusBadge
                    variant={course.status === 'PUBLISHED' ? 'success' : course.status === 'ARCHIVED' ? 'secondary' : 'warning'}
                    className="h-6 px-2 rounded font-medium text-[10px]"
                  >
                    {course.status.charAt(0) + course.status.slice(1).toLowerCase()}
                  </StatusBadge>
                </div>
              )
            },
            {
              header: "Price",
              className: "text-right",
              cell: (course: any) => (
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {course.isFree ? 'Free' : `₹${course.price?.toLocaleString('en-IN') || course.price}`}
                  </p>
                </div>
              )
            },
            {
              header: "Actions",
              className: "text-right",
              cell: (course: any) => (
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button variant="ghost" size="icon" className="size-8 rounded-md text-slate-400 hover:text-primary hover:bg-primary/5">
                      <Edit3 className="size-4" />
                    </Button>
                  </Link>

                  <Link href={`/admin/courses/${course.id}/preview`} target="_blank">
                    <Button variant="ghost" size="icon" className="size-8 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                      <Eye className="size-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (course.status === 'PUBLISHED') archiveMutation.mutate(course.id);
                      else publishMutation.mutate(course.id);
                    }}
                    className="size-8 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    title={course.status === 'PUBLISHED' ? 'Archive' : 'Publish'}
                  >
                    {course.status === 'PUBLISHED' ? (
                      <Archive className="size-4" />
                    ) : (
                      <Rocket className="size-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCourseToDelete(course)}
                    className="size-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            }
          ]}
        />
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-md flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-900">{filteredCourses?.length || 0}</span> courses
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled className="size-8 rounded border-slate-200">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="size-8 flex items-center justify-center rounded bg-primary text-white text-xs font-medium">1</div>
          <Button variant="ghost" size="icon" className="size-8 rounded text-slate-600 hover:text-slate-900">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={!!courseToDelete} onOpenChange={(open: boolean) => !open && setCourseToDelete(null)}>
        <AlertDialogContent className="rounded-xl p-6 max-w-sm font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm mt-2">
              Are you sure you want to delete <span className="text-slate-900 font-medium">"{courseToDelete?.title}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="h-9 px-4 text-sm bg-white">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={() => deleteMutation.mutate(courseToDelete.id)}
                className="h-9 px-4 text-sm bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
