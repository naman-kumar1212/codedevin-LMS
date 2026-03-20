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
        <div className="size-24 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 shadow-inner">
          <Activity size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Offline</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-sm font-medium leading-relaxed uppercase tracking-tight italic">
            Unable to synchronize with the institutional data stream. Please verify your governance credentials and active session.
          </p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          Re-Synchronize
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">
            <span>Governance</span>
            <ChevronRight size={10} className="text-border" />
            <span className="text-primary font-black">Intelligence Index</span>
          </nav>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Institutional <span className="text-primary italic font-serif">Intelligence</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">Real-time performance metrics and growth indicators for the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex text-[10px] font-black tracking-widest uppercase">
            Last 30 Days
          </Button>
          <Button size="sm" className="shadow-lg shadow-primary/20 text-[10px] font-black tracking-widest uppercase">
            Export Dataset
          </Button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenue Platform"
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
          title="Verified Credentials"
          value={(stats?.totalCertificates || 0).toString()}
          icon={Award}
          change="+4.3%"
          trend="up"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend - Minimalist Component */}
        <div className="lg:col-span-2 bg-bg-surface rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-border/50 flex items-center justify-between">
                <div>
                   <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                        <TrendingUp className="size-5 text-success" />
                        Fiscal Progression
                   </h3>
                   <p className="text-[11px] font-medium text-text-muted mt-1">Net revenue accumulation over the fiscal period.</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-primary" />
                        Current
                    </div>
                </div>
            </div>
            <div className="flex-1 p-8 flex items-end gap-3 h-[280px]">
                {/* Simulated Chart Bars */}
                {[45, 60, 55, 85, 70, 95, 120, 110, 130, 150, 140, 160].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                        <div className="w-full relative h-[180px]">
                            <div 
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[10px] bg-bg-subtle rounded-full" 
                                style={{ height: '100%' }}
                            />
                            <div 
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[10px] bg-primary rounded-full shadow-lg shadow-primary/20 transition-all duration-1000 group-hover/bar:brightness-110" 
                                style={{ height: `${h}px` }}
                            />
                        </div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tabular-nums">M{i+1}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-bg-surface rounded-3xl border border-border shadow-sm p-8 flex flex-col">
            <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2 mb-8">
                 <Award className="size-5 text-success" />
                 Top Academic Targets
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
                        <div key={i} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold text-text-secondary uppercase truncate pr-4">{course.title}</p>
                                <p className="text-[11px] font-black text-text-primary tabular-nums">{course._count.enrollments}</p>
                            </div>
                            <AnimatedProgress value={percent} color="#10B981" />
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 p-6 bg-green-50/50 rounded-2xl border border-green-100 text-center">
                <TrendingUp className="size-8 text-green-500/40 mx-auto mb-3" />
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-relaxed">
                    Peak enrollment velocity reached <span className="text-green-800 font-black">2.4x</span> standard baseline.
                </p>
            </div>
        </div>
      </div>

      {/* Deep Intelligence Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-[18px] font-bold text-text-primary">Ecosystem Pulse</h3>
              <p className="text-[12px] font-medium text-text-muted mt-1">Live stream of student enrollments and platform interactions.</p>
            </div>
            <Activity className="size-6 text-primary animate-pulse" />
        </div>

        <DataTable
          data={stats?.recentEnrollments || []}
          columns={[
            {
              header: "STAKEHOLDER",
              cell: (enr: any) => (
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-bg-subtle border border-border flex items-center justify-center text-primary text-[10px] font-bold">
                    {enr.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-text-primary">{enr.student.name}</p>
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{enr.student.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: "ACADEMIC TARGET",
              cell: (enr: any) => (
                <p className="text-[13px] font-bold text-text-secondary">{enr.course.title}</p>
              )
            },
            {
              header: "TIMESTAMP",
              cell: (enr: any) => (
                <div className="flex items-center gap-2 text-text-muted">
                  <History size={14} className="text-primary/30" />
                  <span className="text-[12px] font-medium tabular-nums">
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
