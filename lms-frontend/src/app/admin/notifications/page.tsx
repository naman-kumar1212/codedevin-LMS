'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  Bell, 
  BellOff, 
  User, 
  BookOpen, 
  CreditCard, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Clock,
  Zap,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const notificationIcons: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  account: { icon: <User size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  enrollment: { icon: <BookOpen size={20} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  payment: { icon: <CreditCard size={20} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  system: { icon: <ShieldCheck size={20} />, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  SYSTEM: { icon: <Info size={20} />, color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getMyNotifications(1, 100).then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const notificationList = notificationsData?.data || [];
  const unreadCount = notificationList.filter((n: any) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 font-display">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
           <div className="space-y-3">
              <div className="h-9 w-64 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-4 w-96 bg-slate-50 rounded-lg animate-pulse" />
           </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 font-display">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px]">System Audit & Administrative Alerts</p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest px-4 h-10 hover:bg-slate-50 transition-all"
            >
              <Check size={14} className="mr-2" />
              Mark All as Read
            </Button>
          )}
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
              <Zap size={16} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">{unreadCount} New Alerts</span>
            </div>
          )}
        </div>
      </div>

      {notificationList.length === 0 ? (
        <div className="bg-white rounded-[40px] border-2 border-slate-100 border-dashed p-32 text-center flex flex-col items-center gap-8 shadow-sm">
          <div className="size-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 shadow-inner">
            <BellOff size={48} strokeWidth={1.5} />
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Registry Clear</h3>
            <p className="text-slate-500 font-bold mt-3 leading-relaxed text-sm">
              All administrative logs and alerts have been addressed. We'll broadcast any critical system changes or student activities here.
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
                className={cn(
                  "group relative overflow-hidden bg-white rounded-[32px] border transition-all duration-300 p-8 flex gap-8",
                  notif.isRead 
                    ? "border-slate-100 opacity-60 hover:opacity-100" 
                    : "border-primary/20 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer"
                )}
              >
                {!notif.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                )}
                
                <div className={cn(
                  "size-16 rounded-2xl shrink-0 flex items-center justify-center shadow-inner",
                  style.bgColor,
                  style.color
                )}>
                  {style.icon}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className={cn(
                        "font-black text-xl tracking-tight leading-none transition-colors",
                        notif.isRead ? "text-slate-900" : "text-slate-900 group-hover:text-primary"
                      )}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={12} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className={cn(
                    "text-sm font-bold leading-relaxed",
                    notif.isRead ? "text-slate-500" : "text-slate-600"
                  )}>
                    {notif.message}
                  </p>
                  
                  {!notif.isRead && (
                    <div className="pt-4 flex items-center gap-3">
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">
                        Administrative Action Required
                      </span>
                      <div className="h-px flex-1 bg-primary/10" />
                    </div>
                  )}
                </div>

                {!notif.isRead && (
                   <div className="absolute top-8 right-8 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                         <CheckCircle2 size={20} />
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
