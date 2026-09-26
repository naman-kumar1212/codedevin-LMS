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
  Check,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const notificationIcons: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  account: { icon: <User className="size-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50 border border-blue-100' },
  enrollment: { icon: <BookOpen className="size-4" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50 border border-indigo-100' },
  payment: { icon: <CreditCard className="size-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50 border border-emerald-100' },
  system: { icon: <ShieldCheck className="size-4" />, color: 'text-slate-600', bgColor: 'bg-slate-50 border border-slate-200' },
  SYSTEM: { icon: <Info className="size-4" />, color: 'text-slate-600', bgColor: 'bg-slate-50 border border-slate-200' },
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200/60 rounded" />
            <div className="h-4 w-72 bg-slate-200/60 rounded" />
          </div>
          <div className="h-10 w-32 bg-slate-200/60 rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-white rounded-lg border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notification Center
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review system alerts, user activities, and important administrative updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="hidden sm:flex h-9 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md items-center justify-center text-sm font-medium gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Link>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="h-9 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md items-center gap-2 text-sm font-medium"
            >
              <Check className="size-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar (Optional: could add search/filter here similarly) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Bell className="size-4 text-slate-400" />
            {unreadCount > 0 ? (
                <span>You have <strong className="text-slate-900">{unreadCount} unread</strong> notification{unreadCount !== 1 ? 's' : ''}</span>
            ) : (
                <span>All caught up!</span>
            )}
        </div>
      </div>

      {notificationList.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BellOff className="size-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No Notifications</h4>
          <p className="text-slate-500 mt-1 text-sm max-w-sm mx-auto">There are currently no alerts or messages to display.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificationList.map((notif: any) => {
            const style = notificationIcons[notif.type] || notificationIcons.SYSTEM;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                className={cn(
                  "group relative overflow-hidden bg-white rounded-lg border p-4 flex gap-4",
                  notif.isRead 
                    ? "border-slate-200" 
                    : "border-primary/20 bg-primary/2 hover:border-primary/30 cursor-pointer"
                )}
              >
                {!notif.isRead && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                
                <div className={cn(
                  "size-10 rounded-md shrink-0 flex items-center justify-center",
                  style.bgColor,
                  style.color
                )}>
                  {style.icon}
                </div>
                
                <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className={cn(
                      "font-semibold text-sm",
                      notif.isRead ? "text-slate-700" : "text-slate-900"
                    )}>
                      {notif.title}
                    </h3>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      notif.isRead ? "text-slate-500" : "text-slate-600"
                    )}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-slate-400">
                        <Clock className="size-3" />
                        <span className="text-[11px] font-medium text-slate-500">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                  </div>
                  
                  {!notif.isRead && (
                    <div className="shrink-0 opacity-0 group-hover:opacity-100">
                      <div className="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                         <CheckCircle2 className="size-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
