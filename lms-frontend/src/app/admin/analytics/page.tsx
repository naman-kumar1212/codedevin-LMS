'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Layers,
  BarChart3,
  Wallet,
  Clock,
  History,
  Zap,
  Target,
  Trophy,
  Share2
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

function AnimatedProgress({ value, color, label }: { value: number; color?: string; label?: string }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold tabular-nums">{Math.round(displayValue)}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/50">
        <div
          className="h-full transition-all duration-1000 ease-out flex items-center justify-end pr-1"
          style={{
            width: `${displayValue}%`,
            backgroundColor: color || 'var(--primary)',
            boxShadow: `0 0 12px ${color || 'var(--primary)'}40`
          }}
        >
          <div className="h-1 w-1 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

function PremiumCard({ title, subtitle, icon: Icon, children, className }: any) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group",
      className
    )}>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <Icon size={120} />
      </div>
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.adminStats().then((r: any) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-10 pb-20 animate-in fade-in duration-700">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-bg-subtle rounded-md animate-pulse" />
            <div className="h-10 w-64 bg-bg-subtle rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-bg-subtle rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-bg-subtle rounded-lg animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[120px] rounded-2xl bg-bg-surface border border-border animate-pulse" />
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[400px] bg-bg-surface rounded-3xl border border-border animate-pulse" />
          <div className="h-[400px] bg-bg-surface rounded-3xl border border-border animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-full bg-bg-subtle rounded-xl animate-pulse" />
          <div className="bg-white rounded-[32px] border border-border overflow-hidden h-[300px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6 text-center animate-in zoom-in-95 duration-500">
        <div className="size-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
          <Activity size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Analytics Offline</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-sm">
            Unable to load analytics data. Please verify your connection and try again.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-primary text-white h-10 px-6 rounded-md text-sm font-medium shadow-sm transition-colors hover:bg-primary/90"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Admin</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-primary font-medium">Analytics</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Platform Analytics
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">Monitor your platform's performance and student engagement.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex text-sm font-medium h-10 px-4 rounded-md">
            Last 30 Days
          </Button>
          <Button className="h-10 px-4 rounded-md text-sm font-medium shadow-sm bg-primary text-white border-none hover:bg-primary/90 transition-colors">
            Export Dataset
          </Button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={Wallet}
          change="+12.5%"
          trend="up"
        />
        <StatCard
          title="Active Learners"
          value={(stats?.totalStudents || 0).toString()}
          icon={Users}
          change="+8.2%"
          trend="up"
        />
        <StatCard
          title="Course Enrollments"
          value={(stats?.totalEnrollments || 0).toString()}
          icon={BookOpen}
          change="+24.1%"
          trend="up"
        />
        <StatCard
          title="Certificates Issued"
          value={(stats?.totalCertificates || 0).toString()}
          icon={Award}
          change="+4.3%"
          trend="up"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Minimalist Component */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Revenue Trend
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Monthly revenue overview.</p>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                Current
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 flex items-end gap-2 h-[280px]">
            {/* Simulated Chart Bars */}
            {[45, 60, 55, 85, 70, 95, 120, 110, 130, 150, 140, 160].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                <div className="w-full relative h-[180px]">
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[8px] bg-slate-50 rounded-sm hover:cursor-pointer"
                    style={{ height: '100%' }}
                  />
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[8px] bg-primary rounded-sm transition-all duration-300 group-hover/bar:bg-primary/80"
                    style={{ height: `${h}px` }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-400 group-hover/bar:text-slate-600 transition-colors">M{i + 1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Award className="size-5 text-primary" />
            Popular Courses
          </h3>
          <div className="space-y-6 flex-1">
            {((stats?.popularCourses && stats.popularCourses.length > 0) ? stats.popularCourses : [
              { title: 'Mastering Data Structures', _count: { enrollments: 120 } },
              { title: 'Java Advanced Patterns', _count: { enrollments: 85 } },
              { title: 'C++ Systems Programming', _count: { enrollments: 64 } },
            ]).map((course: any, i: number) => {
              const popularCourses = stats?.popularCourses || [];
              const maxEnr = popularCourses.length > 0 ? Math.max(...popularCourses.map((c: any) => c._count.enrollments)) : 120;
              const percent = Math.round((course._count.enrollments / maxEnr) * 100);
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 truncate pr-4">{course.title}</p>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{course._count.enrollments}</p>
                  </div>
                  <Progress value={percent} className="h-1.5 bg-slate-100" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deep Intelligence Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Enrollments</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Latest student enrollments.</p>
          </div>
          <Activity className="size-5 text-primary" />
        </div>

        <DataTable
          data={stats?.recentEnrollments || []}
          columns={[
            {
              header: "STUDENT",
              cell: (enr: any) => (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium">
                    {enr.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{enr.student.name}</p>
                    <p className="text-xs text-slate-500">{enr.student.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: "COURSE",
              cell: (enr: any) => (
                <p className="text-sm font-medium text-slate-700">{enr.course.title}</p>
              )
            },
            {
              header: "TIMESTAMP",
              cell: (enr: any) => (
                <div className="flex items-center gap-2 text-slate-500">
                  <History size={14} className="text-slate-400" />
                  <span className="text-sm font-medium tabular-nums">
                    {new Date(enr.enrolledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )
            },
            {
              header: "STATUS",
              cell: () => (
                <StatusBadge variant="success">Active</StatusBadge>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
