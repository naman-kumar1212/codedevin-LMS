'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import { useState } from 'react';
import {
  Users,
  BookOpen,
  Wallet,
  Award,
  Plus,
  ChevronRight,
  TrendingUp,
  Radio,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.adminStats().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200/60 rounded-md" />
            <div className="h-4 w-96 bg-slate-200/60 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 bg-slate-200/60 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200/60 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200/60 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
          <div className="xl:col-span-6 h-96 bg-slate-200/60 rounded-2xl" />
          <div className="xl:col-span-4 space-y-6">
            <div className="h-48 bg-slate-200/60 rounded-2xl" />
            <div className="h-48 bg-slate-200/60 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const statCardsData = [
    {
      label: 'Total Students',
      value: stats?.totalStudents?.toLocaleString() || '1,250',
      icon: Users,
      change: '+12.5%',
      trend: 'up' as const,
    },
    {
      label: 'Total Enrollments',
      value: stats?.totalEnrollments?.toLocaleString() || '3,420',
      icon: BookOpen,
      change: '+8.2%',
      trend: 'up' as const,
    },
    {
      label: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '₹2,09,889',
      icon: Wallet,
      change: '+15.4%',
      trend: 'up' as const,
    },
    {
      label: 'Active Courses',
      value: '170+',
      icon: Award,
      change: 'New Library',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-text-secondary mt-1 text-sm">Overview of your LMS platform and student growth.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-bg-surface p-1 rounded-xl flex items-center gap-1 border border-border shadow-sm">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                  timeRange === range
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-subtle'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Link href="/admin/courses/create">
            <Button size="sm" className="gap-2">
              <Plus size={16} />
              Initialize Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCardsData.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.label}
            value={card.value}
            icon={card.icon}
            change={card.change}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
        {/* Recent Enrollments */}
        <div className="xl:col-span-6 bg-bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center bg-bg-subtle/30">
            <h2 className="text-lg font-bold tracking-tight text-text-primary">Recent Enrollments</h2>
            <Link href="/admin/students">
              <Button variant="link" size="sm" className="text-primary gap-2 p-0 h-auto font-bold uppercase tracking-widest text-[10px] group">
                View All
                <ChevronRight size={14} className="group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto p-0">
            <DataTable
              data={(stats?.recentEnrollments || []).slice(0, 6)}
              className="border-none shadow-none rounded-none"
              columns={[
                {
                  header: "Student",
                  cell: (enr: any) => (
                    <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-bg-subtle border border-border flex items-center justify-center text-primary text-xs font-bold shadow-sm group-hover:border-primary/30">
                        {enr.student?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{enr.student?.name}</span>
                    </div>
                  )
                },
                {
                  header: "Course",
                  cell: (enr: any) => (
                    <span className="text-sm text-text-secondary truncate max-w-[200px] block">{enr.course?.title}</span>
                  )
                },
                {
                  header: "Status",
                  cell: () => (
                    <StatusBadge variant="success" className="text-[9px]">Active</StatusBadge>
                  )
                },
                {
                  header: "Date",
                  className: "text-right",
                  headerClassName: "text-right",
                  cell: (enr: any) => (
                    <span className="text-[10px] font-bold text-text-muted tabular-nums uppercase">{new Date(enr.enrolledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  )
                }
              ]}
            />
          </div>
        </div>

        {/* Live System Integration */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-bg-subtle/30">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">Upcoming Classes</h2>
              <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-widest gap-2">
                <Calendar size={14} />
                Schedule
              </Button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4 p-5 rounded-xl bg-bg-subtle border border-border group hover:border-primary/20">
                <div className="bg-primary text-white p-3 rounded-xl text-center min-w-[60px] shadow-lg shadow-primary/10">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">MAR</p>
                  <p className="text-xl font-bold">20</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-primary line-clamp-1">Introduction to Programming</h3>
                  <p className="text-[10px] text-text-muted font-bold mt-1 flex items-center gap-2">
                    <Radio size={12} className="text-primary" />
                    15:00 UTC <span className="opacity-30">•</span> Global Stream
                  </p>
                  <div className="flex mt-4 gap-3">
                    <Button size="sm" className="flex-1 h-9 text-[9px] uppercase tracking-widest">Join Live</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-9 text-[9px] uppercase tracking-widest">Manage</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Actions */}
          <div className="bg-bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col">
            <div className="pb-4 border-b border-border mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Quick Actions</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Create Course', icon: Plus, path: '/admin/courses/create' },
                { label: 'View Payments', icon: Wallet, path: '/admin/payments' },
                { label: 'Settings', icon: Award, path: '/admin/settings' }
              ].map((cmd, i) => (
                <Link key={i} href={cmd.path} className="flex items-center justify-between p-4 bg-bg-subtle/50 rounded-xl hover:bg-primary/5 group/cmd border border-transparent hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-white border border-border flex items-center justify-center text-primary shadow-sm">
                      <cmd.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-text-primary tracking-tight">{cmd.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-text-muted opacity-30 group-hover/cmd:opacity-100 group-hover/cmd:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Matrix */}
      <div className="bg-bg-surface p-8 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary uppercase">Revenue Overview</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Revenue for 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-bg-subtle p-1 rounded-xl border border-border">
              <button className="px-5 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">Trajectory</button>
              <button className="px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary">Tabular</button>
            </div>
            <div className="h-8 w-px bg-border mx-2"></div>
            <button className="size-9 flex items-center justify-center bg-bg-surface border border-border rounded-lg text-text-muted hover:text-primary">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        <div className="h-60 relative flex items-end justify-between gap-4 px-2 border-b border-border pb-8">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-dashed border-text-muted h-0 w-full"></div>
            ))}
          </div>
          <div className="w-full h-full relative z-1">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 Q10,75 20,85 T40,65 T60,45 T80,55 T100,25 L100,100 L0,100 Z" fill="url(#grad)" opacity="0.1"></path>
              <path d="M0,80 Q10,75 20,85 T40,65 T60,45 T80,55 T100,25" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
              <defs>
                <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 1 }}></stop>
                  <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-[25%] right-[2%] size-2.5 bg-bg-surface border-2 border-primary rounded-full shadow-lg"></div>
          </div>
          <div className="absolute bottom-2 w-full flex justify-between text-[9px] text-text-muted font-bold uppercase tracking-widest px-2">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
        </div>
      </div>
    </div>
  );
}


