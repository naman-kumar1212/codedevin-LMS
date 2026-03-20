'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  Bell, 
  BellOff, 
  User, 
  BookOpen, 
  Video, 
  Award, 
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const notificationIcons: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  account: { icon: <User size={20} />, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  enrollment: { icon: <BookOpen size={20} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  live_class: { icon: <Video size={20} />, color: 'text-primary', bgColor: 'bg-primary/10' },
  certificate: { icon: <Award size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  SYSTEM: { icon: <Info size={20} />, color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getMyNotifications().then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notificationList = notificationsData?.data || [];
  const unreadCount = notificationList.filter((n: any) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-bg-subtle rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-bg-subtle rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-bg-subtle rounded-2xl animate-pulse" />
        </div>

        {/* Notifications List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-bg-surface rounded-[28px] border border-border p-6 flex gap-6 animate-pulse">
              <div className="size-14 rounded-2xl bg-bg-subtle shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 w-48 bg-bg-subtle rounded" />
                  <div className="h-3 w-16 bg-bg-subtle rounded" />
                </div>
                <div className="h-4 w-full bg-bg-subtle rounded" />
                <div className="h-4 w-3/4 bg-bg-subtle rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 font-sans pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Notification Center</h1>
          <p className="text-text-secondary font-medium">Real-time updates on your learning journey and account</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 animate-bounce">
            <Zap size={16} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-widest">{unreadCount} New Alerts</span>
          </div>
        )}
      </div>

      {notificationList.length === 0 ? (
        <div className="bg-bg-surface rounded-[40px] border border-border border-dashed p-24 text-center flex flex-col items-center gap-8 shadow-sm">
          <div className="size-28 bg-bg-subtle rounded-[32px] flex items-center justify-center text-text-muted shadow-inner relative group">
            <BellOff size={56} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-text-primary tracking-tight">System Silenced</h3>
            <p className="text-text-secondary font-medium mt-3 leading-relaxed">
              Your notification vault is currently empty. We'll broadcast important updates here whenever they occur.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notificationList.map((notif: any) => {
            const style = notificationIcons[notif.type] || notificationIcons.SYSTEM;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                className={`group bg-bg-surface rounded-[28px] border transition-all duration-300 p-6 flex gap-6 cursor-pointer relative overflow-hidden ${
                  notif.isRead 
                    ? 'border-border opacity-75 grayscale-[0.3]' 
                    : 'border-primary ring-1 ring-primary/5 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10'
                }`}
              >
                {!notif.isRead && (
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                )}
                
                <div className={`size-14 rounded-2xl shrink-0 flex items-center justify-center shadow-inner ${style.bgColor} ${style.color}`}>
                  {style.icon}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={`font-black text-lg tracking-tight transition-colors ${notif.isRead ? 'text-text-primary/70' : 'text-text-primary group-hover:text-primary'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-text-muted">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm leading-relaxed font-medium ${notif.isRead ? 'text-text-secondary/70' : 'text-text-secondary'}`}>
                    {notif.message}
                  </p>
                  
                  {!notif.isRead && (
                    <div className="pt-3 flex items-center gap-2 group/mark">
                      <div className="h-0.5 w-6 bg-primary/20 rounded-full" />
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] transform transition-transform group-hover/mark:translate-x-1">
                        Mark as read
                      </span>
                    </div>
                  )}
                </div>

                {!notif.isRead && (
                   <div className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/10">
                         <CheckCircle2 size={16} />
                      </div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
