'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import {
    Video,
    Plus,
    Search,
    Users,
    Clock,
    Settings2,
    VideoOff,
    ArrowLeft,
    BookOpen,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminLiveClassesPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'Upcoming' | 'Active' | 'Completed'>('Upcoming');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [courseId, setCourseId] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(60);

    const { data: liveClasses, isLoading } = useQuery({
        queryKey: ['admin-live-classes'],
        queryFn: () => api.getAdminLiveClasses().then(r => r.data),
    });

    const { data: courses } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: () => api.adminCourses().then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: () => api.createLiveClass({ title, courseId, scheduledAt, durationMinutes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-live-classes'] });
            setIsCreateModalOpen(false);
            setTitle('');
            setCourseId('');
            setScheduledAt('');
            setDurationMinutes(60);
        }
    });

    const filteredClasses = (liveClasses || []).filter((cls: any) => {
        const now = new Date();
        const start = new Date(cls.scheduledAt);
        const end = new Date(start.getTime() + cls.durationMinutes * 60000);

        if (filter === 'Upcoming') return start > now;
        if (filter === 'Active') return start <= now && end >= now;
        if (filter === 'Completed') return end < now;
        return true;
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
                {/* Header Skeleton */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="h-10 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
                        <div className="h-4 w-96 bg-slate-200/60 rounded-md animate-pulse" />
                    </div>
                    <div className="h-12 w-48 bg-slate-200/60 rounded-xl animate-pulse" />
                </div>

                {/* Control Bar Skeleton */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="h-12 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
                    <div className="h-12 flex-1 bg-slate-200/60 rounded-xl animate-pulse" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-[24px] border border-slate-100 h-80 animate-pulse shadow-sm shadow-primary/5" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                        Live Classes
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm font-medium max-w-xl">
                        Manage real-time instructional sessions, coordinate with educators, and monitor student engagement across live broadcasts.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm shadow-primary/5">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center gap-2 group border-none"
                    >
                        <Plus className="size-4 group-hover:scale-110 transition-transform" />
                        Schedule Session
                    </Button>
                    <div className="w-px h-8 bg-slate-100 hidden sm:block mx-1" />
                    <Link href="/admin/dashboard" className="hidden sm:flex size-12 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 transition-all rounded-xl items-center justify-center">
                        <ArrowLeft size={18} />
                    </Link>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-100 shadow-sm w-full md:w-auto">
                    {['Upcoming', 'Active', 'Completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab as any)}
                            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-slate-400 hover:text-primary'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 group w-full bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search sessions by title or instructor..."
                        className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-12 pr-6 text-[13px] font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClasses.length > 0 ? filteredClasses.map((cls: any) => (
                    <div key={cls.id} className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm shadow-primary/5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative">
                        <div className="flex items-start justify-between mb-8">
                            <div className="bg-primary/5 text-primary p-3 rounded-2xl text-center min-w-[70px] border border-primary/10 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                                    {new Date(cls.scheduledAt).toLocaleDateString('en-IN', { month: 'short' })}
                                </p>
                                <p className="text-3xl font-black tabular-nums leading-none mt-1">
                                    {new Date(cls.scheduledAt).getDate()}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {cls.course?.category || 'General'}
                                </span>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-full">
                                    <Users size={10} className="text-primary/40" />
                                    {cls.course?._count?.enrollments || 0} Registered
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-snug line-clamp-2 h-12" title={cls.title}>
                                {cls.title}
                            </h3>
                            <div className="flex items-center gap-2 group/course">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/course:bg-primary/5 group-hover/course:text-primary transition-all">
                                    <BookOpen className="size-4" />
                                </div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider truncate">{cls.course?.title}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock className="size-4 text-primary/30" />
                                <div className="flex flex-col">
                                    <span className="text-slate-900">{new Date(cls.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-[8px] opacity-60">Duration: {cls.durationMinutes}m</span>
                                </div>
                            </div>
                            <div className="flex gap-2 translate-x-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <a
                                    href={cls.zoomJoinUrl} target="_blank" rel="noreferrer"
                                    className="bg-primary text-white size-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                    title="Setup Session"
                                >
                                    <Video size={16} />
                                </a>
                                <button className="size-10 bg-white border border-slate-100 text-slate-300 rounded-xl flex items-center justify-center hover:text-primary hover:border-primary/30 transition-all">
                                    <Settings2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                        <div className="size-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 mb-6 font-semibold">
                            <VideoOff size={32} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">No Sessions Found</h4>
                        <p className="text-slate-400 mt-2 text-sm font-medium max-w-xs mx-auto italic">There are no instructional sessions scheduled for the selected status.</p>
                        <button onClick={() => setFilter('Upcoming')} className="mt-8 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-6 py-3 rounded-xl hover:bg-primary/10 transition-all">
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Section */}
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Settings2 className="size-4 text-slate-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast Engine Active</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Video size={16} className="text-slate-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streaming Node Verified</p>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">LMS Live System v4.2.0</p>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-xl sm:rounded-[2.5rem] border-none p-0 overflow-hidden bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-8 sm:p-12">
                        <DialogHeader className="mb-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Video className="size-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">Schedule Session</DialogTitle>
                                    <DialogDescription className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1.5 grayscale opacity-70">Initialize Academic Broadcast</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Academic Theme / Title</label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Advanced State Management"
                                    className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:border-primary/20 focus:bg-white transition-all text-sm font-bold shadow-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Associated Course</label>
                                <Select value={courseId} onValueChange={setCourseId}>
                                    <SelectTrigger className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:border-primary/20 focus:bg-white transition-all text-sm font-bold shadow-sm">
                                        <SelectValue placeholder="Select an active course" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                                        {courses?.map((c: any) => (
                                            <SelectItem 
                                                key={c.id} 
                                                value={c.id}
                                                className="rounded-xl py-3 px-4 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
                                            >
                                                <span className="text-xs font-bold uppercase tracking-wider">{c.title}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date & Time</label>
                                    <Input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={e => setScheduledAt(e.target.value)}
                                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:border-primary/20 focus:bg-white transition-all text-sm font-bold shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Duration <span className="text-[8px] opacity-40 lowercase tracking-normal font-medium">(minutes)</span></label>
                                    <Input
                                        type="number"
                                        value={durationMinutes}
                                        onChange={e => setDurationMinutes(Number(e.target.value))}
                                        min="15" step="15"
                                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:border-primary/20 focus:bg-white transition-all text-sm font-bold shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border-none"
                            >
                                Discard Session
                            </Button>
                            <Button
                                disabled={createMutation.isPending || !title || !courseId || !scheduledAt}
                                onClick={() => createMutation.mutate()}
                                className="flex-[1.5] h-14 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100 border-none"
                            >
                                {createMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : 'Initialize Broadcast'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
