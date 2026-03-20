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
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 font-display">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-200/60 rounded-md animate-pulse" />
          </div>
          <div className="h-12 w-48 bg-slate-200/60 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
        <div className="h-20 w-full bg-slate-200/60 rounded-[32px] animate-pulse shadow-sm" />
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="h-16 bg-slate-200/60 animate-pulse border-b border-slate-100" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-white animate-pulse border-b border-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 font-display pb-20">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Curriculum Hub</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed max-w-xl">
            Manage your educational portfolio, track engagement metrics, and orchestrate learning pathways from a central command center.
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="h-14 px-8 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white">
            <PlusCircle className="size-5" />
            Initialize Unit
          </Button>
        </Link>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Units" 
          value={stats.total} 
          icon={Layers} 
          description="Consolidated curriculum assets in the registry."
          trend="neutral"
        />
        <StatCard 
          title="Published" 
          value={stats.published} 
          icon={CheckCircle2} 
          change={`${Math.round((stats.published / stats.total) * 100)}%`}
          trend="up"
          description="Currently visible to active stakeholders."
        />
        <StatCard 
          title="Total Learners" 
          value={stats.enrollments} 
          icon={Users} 
          description="Cumulative enrollment across all units."
          trend="up"
        />
      </div>

      {/* Orchestration Controls */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search curriculum entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 border-transparent rounded-2xl py-6 pl-14 pr-12 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:border-primary/20 transition-all outline-none h-14"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100/50">
          {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300",
                filter === f 
                  ? "bg-white text-primary shadow-lg shadow-slate-200/50 border border-slate-100" 
                  : "text-slate-400 hover:text-slate-900"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Registry */}
      {filteredCourses && filteredCourses.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-slate-200/60 p-24 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-sm">
          <div className="size-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border border-slate-100 shadow-inner">
            <BookOpen className="size-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No units identified</h3>
          <p className="text-slate-400 text-sm mt-3 max-w-xs font-medium leading-relaxed">
            Your query "<span className="text-slate-900">{search}</span>" did not intersect with any registered curriculum entities.
          </p>
          <Button
            variant="ghost"
            onClick={() => { setSearch(''); setFilter('ALL'); }}
            className="mt-10 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-8 h-12 rounded-2xl"
          >
            Reset Matrix Parameters
          </Button>
        </div>
      ) : (
        <DataTable
          data={filteredCourses || []}
          columns={[
            {
              header: "Curriculum Identity",
              cell: (course: any) => (
                <div className="flex items-center gap-6 group">
                  <div className="size-16 rounded-[1.25rem] bg-slate-50 overflow-hidden border border-slate-100 shrink-0 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-md">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-slate-200 bg-slate-50/50">
                        <Book className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link 
                      href={`/admin/courses/${course.id}/edit`} 
                      className="text-base font-black text-slate-900 hover:text-primary transition-all duration-300 tracking-tight block mb-1.5 truncate max-w-[320px]"
                    >
                      {course.title}
                    </Link>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="bg-slate-50/50 border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 rounded-lg group-hover:text-primary group-hover:border-primary/20 transition-colors">
                          <Tag className="size-3 mr-1" />
                          {course.category || 'Professional'}
                       </Badge>
                       <span className="size-1 rounded-full bg-slate-200" />
                       <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                          {course.modules?.length || 0} Modules
                       </span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: "Engagement",
              className: "text-center",
              cell: (course: any) => (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                    <Users className="size-3.5 text-primary" />
                    <span className="text-sm font-black text-slate-900 tabular-nums">{course._count?.enrollments || 0}</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Active Learners</p>
                </div>
              )
            },
            {
              header: "Audit Status",
              className: "text-center",
              cell: (course: any) => (
                <div className="flex justify-center">
                  <StatusBadge 
                    variant={course.status === 'PUBLISHED' ? 'success' : course.status === 'ARCHIVED' ? 'secondary' : 'warning'}
                    className="h-7 px-3 rounded-xl shadow-sm border-transparent"
                  >
                    {course.status}
                  </StatusBadge>
                </div>
              )
            },
            {
              header: "Fiscal Meta",
              className: "text-right",
              cell: (course: any) => (
                <div>
                  <p className="text-[15px] font-black text-slate-900 tracking-tight tabular-nums">
                    {course.isFree ? 'Complimentary' : `₹${course.price?.toLocaleString('en-IN') || course.price}`}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Currency: INR</p>
                </div>
              )
            },
            {
              header: "Governance",
              className: "text-right",
              cell: (course: any) => (
                <div className="flex items-center justify-end gap-2.5">
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-lg transition-all group/btn">
                      <Edit3 className="size-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                  </Link>

                  <Link href={`/admin/courses/${course.id}/preview`} target="_blank">
                    <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-100 hover:shadow-lg transition-all group/btn">
                      <Eye className="size-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                  </Link>

                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (course.status === 'PUBLISHED') archiveMutation.mutate(course.id);
                      else publishMutation.mutate(course.id);
                    }}
                    className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:shadow-lg transition-all group/btn"
                  >
                    {course.status === 'PUBLISHED' ? (
                      <Archive className="size-4 group-hover/btn:scale-110 transition-transform" />
                    ) : (
                      <Rocket className="size-4 group-hover/btn:scale-110 transition-transform" />
                    )}
                  </Button>

                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={() => setCourseToDelete(course)}
                    className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all group/btn"
                  >
                    <Trash2 className="size-4 group-hover/btn:scale-110 transition-transform" />
                  </Button>
                </div>
              )
            }
          ]}
        />
      )}

      {/* Registry Footer */}
      <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 rounded-b-[2.5rem] flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Registry Analytics: <span className="text-slate-900">{filteredCourses?.length || 0}</span> Units in Context
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" disabled className="size-10 rounded-xl border-slate-100 text-slate-200 cursor-not-allowed">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="size-10 flex items-center justify-center rounded-xl bg-primary text-white text-[11px] font-black shadow-lg shadow-primary/20">1</div>
          <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Deletion Governance Modal */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open: boolean) => !open && setCourseToDelete(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-[0_32px_128px_rgba(0,0,0,0.18)] p-10 max-w-md font-display overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
          <AlertDialogHeader>
            <div className="size-20 rounded-[1.75rem] bg-red-50 flex items-center justify-center text-red-600 mb-8 mx-auto shadow-sm ring-1 ring-red-100">
              <AlertTriangle className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-center">
              Execute Deletion?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-center mt-4 leading-relaxed">
              This protocol will permanently purge <span className="text-slate-900 font-black">"{courseToDelete?.title}"</span> from the database. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 sm:justify-center gap-4">
            <AlertDialogCancel asChild>
              <Button variant="ghost" className="rounded-2xl h-14 px-10 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50">
                Cancel Op
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={() => deleteMutation.mutate(courseToDelete.id)}
                className="rounded-2xl h-14 px-10 text-[11px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-200 border-none"
              >
                Confirm Purge
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
