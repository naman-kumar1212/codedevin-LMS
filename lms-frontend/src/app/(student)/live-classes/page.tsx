'use client';

import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Play,
  Monitor,
  Zap,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface LiveClass {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  zoomJoinUrl: string;
  recordingUrl?: string;
  course: { id: string; title: string };
}

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLiveClasses()
      .then((res) => setClasses(res.data))
      .catch(() => setError('Failed to load live classes'))
      .finally(() => setLoading(false));
  }, []);

  const isLive = (scheduledAt: string, durationMinutes: number) => {
    const start = new Date(scheduledAt).getTime();
    const end = start + durationMinutes * 60 * 1000;
    const now = Date.now();
    return now >= start && now <= end;
  };

  const isUpcoming = (scheduledAt: string) => new Date(scheduledAt).getTime() > Date.now();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Live Classes</h1>
          <p className="text-text-secondary font-medium">Interactive learning sessions with industry experts</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-2xl border border-primary/10">
          <Monitor size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Virtualized Classroom</span>
        </div>
      </div>

      {error ? (
        <div className="bg-error-light/30 border border-error/10 rounded-[32px] p-12 text-center flex flex-col items-center gap-4">
          <div className="size-16 bg-error-light rounded-2xl flex items-center justify-center text-error">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Connection Error</h3>
          <p className="text-text-secondary max-w-sm mx-auto">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Retry Connection</Button>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-bg-surface rounded-[40px] border border-border border-dashed p-20 text-center flex flex-col items-center gap-6 shadow-sm">
          <div className="size-24 bg-bg-subtle rounded-3xl flex items-center justify-center text-text-muted shadow-inner relative">
            <Video size={48} />
            <div className="absolute top-0 right-0 size-6 bg-primary rounded-full border-4 border-bg-surface" />
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">No sessions scheduled</h3>
            <p className="text-text-secondary font-medium mt-2 leading-relaxed">
              New live interactive sessions for your enrolled courses will appear here. Stay tuned for upcoming webinars and masterclasses.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((cls) => {
            const live = isLive(cls.scheduledAt, cls.durationMinutes);
            const upcoming = isUpcoming(cls.scheduledAt);

            return (
              <div key={cls.id} className={`group bg-bg-surface border rounded-[32px] p-8 flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 ${live ? 'border-primary ring-4 ring-primary/5' : 'border-border'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{cls.course.title}</p>
                    <h3 className="text-lg font-bold text-text-primary leading-tight line-clamp-2 min-h-14">{cls.title}</h3>
                  </div>
                  {live ? (
                    <div className="flex items-center gap-2 bg-error text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-error/20">
                      <Zap size={12} fill="currentColor" />
                      LIVE
                    </div>
                  ) : upcoming ? (
                    <StatusBadge variant="secondary" className="uppercase tracking-widest text-[9px]">Upcoming</StatusBadge>
                  ) : cls.recordingUrl ? (
                    <StatusBadge variant="success" className="uppercase tracking-widest text-[9px]">Recording Available</StatusBadge>
                  ) : (
                    <StatusBadge variant="outline" className="uppercase tracking-widest text-[9px] opacity-50">Session Ended</StatusBadge>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
                    <div className="size-8 rounded-lg bg-bg-subtle flex items-center justify-center text-text-muted">
                      <Calendar size={16} />
                    </div>
                    <span>{formatDate(cls.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
                    <div className="size-8 rounded-lg bg-bg-subtle flex items-center justify-center text-text-muted">
                      <Clock size={16} />
                    </div>
                    <span>{formatTime(cls.scheduledAt)} · {cls.durationMinutes} minutes</span>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  {(live || upcoming) ? (
                    <a
                      href={cls.zoomJoinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <Button 
                        size="lg"
                        className={`w-full h-14 rounded-2xl font-bold uppercase tracking-widest group shadow-xl transition-all duration-300 ${live ? 'bg-primary shadow-primary/20 hover:scale-[1.02]' : 'bg-slate-900 shadow-slate-900/10 hover:bg-slate-800'}`}
                      >
                        {live ? (
                          <div className="flex items-center gap-2">
                             JOIN LIVE SESSION
                             <ExternalLink size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </div>
                        ) : (
                          'Join Classroom'
                        )}
                      </Button>
                    </a>
                  ) : cls.recordingUrl ? (
                    <a
                      href={cls.recordingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <Button 
                        variant="outline"
                        size="lg"
                        className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 group border-2 border-primary/10 hover:border-primary/30"
                      >
                        <Play size={18} fill="currentColor" className="text-primary" />
                        Watch Recording
                      </Button>
                    </a>
                  ) : (
                    <div className="text-center py-4 rounded-2xl bg-bg-subtle border border-border border-dashed">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No recording available</span>
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
