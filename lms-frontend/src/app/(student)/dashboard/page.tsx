'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle, 
  Award, 
  Clock, 
  Play, 
  Search,
  Book,
  Calendar,
  Video,
  ArrowRight,
  TrendingUp,
  Layout,
  Bell
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: myCourses, isLoading: loadingCourses } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => api.getMyCourses().then((r) => r.data),
  });

  const { data: unreadNotifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => api.getUnreadNotificationsCount().then((r) => r.data),
  });

  const { data: myCertificates, isLoading: loadingCertificates } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => api.getMyCertificates().then((r) => r.data),
  });

  const { data: liveClasses, isLoading: loadingClasses } = useQuery({
    queryKey: ['live-classes'],
    queryFn: () => api.getLiveClasses().then((r) => r.data),
  });

  const isLoading = loadingCourses || loadingNotifications || loadingCertificates || loadingClasses;

  const courses = myCourses || [];
  const certsCount = myCertificates?.length || 0;
  const unreadCount = unreadNotifications?.count || 0;
  const upcomingClasses = liveClasses?.filter((c: any) => new Date(c.scheduledAt).getTime() > Date.now()) || [];

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700 font-sans">
        <div className="h-[300px] md:h-64 rounded-[32px] bg-bg-subtle animate-pulse border border-border" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[104px] rounded-2xl bg-bg-subtle animate-pulse border border-border" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-bg-subtle animate-pulse" />
                <div className="h-6 w-48 bg-bg-subtle animate-pulse rounded-md" />
              </div>
            </div>
            <div className="grid gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[120px] sm:h-[136px] rounded-3xl bg-bg-subtle animate-pulse border border-border" />
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="size-8 rounded-lg bg-bg-subtle animate-pulse" />
                <div className="h-6 w-32 bg-bg-subtle animate-pulse rounded-md" />
              </div>
              <div className="flex flex-col gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-44 rounded-3xl bg-bg-subtle animate-pulse border border-border" />
                ))}
              </div>
            </section>
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="size-8 rounded-lg bg-bg-subtle animate-pulse" />
                <div className="h-6 w-32 bg-bg-subtle animate-pulse rounded-md" />
              </div>
              <div className="flex flex-col gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 rounded-3xl bg-bg-subtle animate-pulse border border-border" />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[100px] -mr-24 -mt-24 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-light text-[10px] font-bold uppercase tracking-widest mb-4">
              <TrendingUp size={12} />
              Academic Progress Update
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Track your learning journey, attend live classes and manage your academic profile in one place.
            </p>
          </div>
          <Link href="/courses">
            <Button size="lg" className="h-14 px-8 text-sm font-bold uppercase tracking-widest group bg-primary hover:bg-white hover:text-primary transition-all duration-300">
              EXPLORE COURSES
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Courses"
          value={courses.length}
          icon={BookOpen}
          change="+2 this month"
          trend="up"
          className="bg-bg-surface"
        />
        <StatCard
          title="Certificates"
          value={certsCount}
          icon={Award}
          change="Lifetime"
          trend="neutral"
          className="bg-bg-surface"
        />
        <StatCard
          title="Notifications"
          value={unreadCount}
          icon={Bell}
          change="Unread"
          trend="neutral"
          className="bg-bg-surface"
        />
        <StatCard
          title="Live Sessions"
          value={upcomingClasses.length}
          icon={Video}
          change="Upcoming"
          trend="neutral"
          className="bg-bg-surface"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content: Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                <Layout size={18} />
              </div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Active Learning Path</h3>
            </div>
            <Link href="/my-courses">
              <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest">
                VIEW ALL
              </Button>
            </Link>
          </div>

          <div className="grid gap-5">
            {courses.length === 0 ? (
              <div className="bg-bg-surface rounded-3xl border border-border p-12 text-center shadow-sm">
                <div className="size-16 bg-bg-subtle rounded-2xl flex items-center justify-center text-text-muted mx-auto mb-6">
                  <Book size={32} />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No active enrollments</h3>
                <p className="text-text-secondary text-sm mb-8 max-w-sm mx-auto">Start your learning journey by exploring our available professional courses.</p>
                <Link href="/courses">
                  <Button className="font-bold uppercase tracking-widest px-8">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              courses.slice(0, 3).map((enr: any) => (
                <div key={enr.courseId} className="group bg-bg-surface p-5 rounded-3xl border border-border flex flex-col sm:flex-row gap-6 items-center hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <div className="size-24 rounded-2xl overflow-hidden shrink-0 border border-border relative">
                    {enr.course?.thumbnailUrl ? (
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={enr.course.thumbnailUrl} alt={enr.course.title} />
                    ) : (
                      <div className="w-full h-full bg-bg-subtle flex items-center justify-center text-text-muted">
                        <BookOpen size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors line-clamp-1">{enr.course?.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Module 14 of 32</span>
                          <span className="text-[10px] text-border">•</span>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">In Progress</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="w-full bg-bg-subtle h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[45%] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                        </div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">45% COMPLETION</p>
                      </div>
                      <Link href={`/course/${enr.courseId}`}>
                        <Button size="sm" className="h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                          CONTINUE
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-10">
          {/* Scheduled Sessions */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <Video size={18} />
              </div>
              <h3 className="text-lg font-bold text-text-primary tracking-tight">Live Classes</h3>
            </div>
            
            {upcomingClasses.length > 0 ? (
              <div className="grid gap-4">
                {upcomingClasses.slice(0, 2).map((cls: any) => (
                  <div key={cls.id} className="bg-bg-surface p-5 rounded-3xl border border-border shadow-sm hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                        {new Date(cls.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        <Clock size={14} className="text-primary" />
                        {cls.durationMinutes}m
                      </div>
                    </div>
                    <h4 className="font-bold text-text-primary text-sm mb-1 leading-snug line-clamp-2">{cls.title}</h4>
                    <p className="text-[11px] font-medium text-text-secondary mb-6">{cls.course?.title}</p>
                    <a href={cls.zoomJoinUrl} target="_blank" rel="noreferrer" className="block">
                      <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-widest shadow-xl">
                        JOIN SESSION
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-bg-subtle rounded-3xl p-6 text-center border border-dashed border-border">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No upcoming sessions</p>
              </div>
            )}
          </section>

          {/* Academic Credentials */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="size-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Award size={18} />
              </div>
              <h3 className="text-lg font-bold text-text-primary tracking-tight">Recent Certificates</h3>
            </div>

            {myCertificates && myCertificates.length > 0 ? (
              <div className="grid gap-4">
                {myCertificates.slice(0, 2).map((cert: any) => (
                  <div key={cert.id} className="group bg-slate-900 p-5 rounded-3xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-12 -mt-12 opacity-50" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/10 shadow-inner">
                        <Award size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate tracking-tight">{cert.course?.title}</h4>
                        <Link href="/certificates" className="text-[10px] font-bold text-primary-light uppercase tracking-widest hover:underline mt-1 inline-block">
                          View Certificate
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-bg-subtle rounded-3xl p-6 text-center border border-dashed border-border">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No certificates yet</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

