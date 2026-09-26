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
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="flex justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-slate-200/60 rounded" />
                        <div className="h-4 w-72 bg-slate-200/60 rounded" />
                    </div>
                    <div className="h-10 w-32 bg-slate-200/60 rounded" />
                </div>

                {/* Control Bar Skeleton */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-10 w-64 bg-slate-200/60 rounded" />
                    <div className="h-10 flex-1 bg-slate-200/60 rounded" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-lg border border-slate-100 h-64" />
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
                        Live Classes
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Manage real-time instructional sessions, coordinate with educators, and monitor student engagement.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="hidden sm:flex h-9 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md items-center justify-center text-sm font-medium gap-2">
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white h-9 px-4 rounded-md text-sm font-medium flex items-center gap-2"
                    >
                        <Plus className="size-4" />
                        Schedule Session
                    </Button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-md border border-slate-200 w-full sm:w-auto">
                    {['Upcoming', 'Active', 'Completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab as any)}
                            className={`px-3 py-1.5 rounded text-sm font-medium flex-1 sm:flex-none ${filter === tab
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search sessions by title or instructor..."
                        className="w-full h-10 bg-white border border-slate-200 rounded-md py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.length > 0 ? filteredClasses.map((cls: any) => (
                    <div key={cls.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                            <div className="bg-slate-50 text-slate-700 py-1.5 px-3 rounded text-center border border-slate-100">
                                <p className="text-[10px] font-semibold uppercase text-slate-500">
                                    {new Date(cls.scheduledAt).toLocaleDateString('en-IN', { month: 'short' })}
                                </p>
                                <p className="text-xl font-bold leading-none mt-0.5">
                                    {new Date(cls.scheduledAt).getDate()}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">
                                    {cls.course?.category || 'General'}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                    <Users className="size-3" />
                                    <span>{(cls.course?._count?.enrollments || 0)} Enrolled</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6 flex-1">
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-2" title={cls.title}>
                                {cls.title}
                            </h3>
                            <div className="flex items-center gap-2 pt-1">
                                <BookOpen className="size-3.5 text-slate-400 shrink-0" />
                                <p className="text-xs text-slate-600 truncate">{cls.course?.title}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-slate-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-900">{new Date(cls.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-[10px] text-slate-500">{cls.durationMinutes} min</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={cls.zoomJoinUrl} target="_blank" rel="noreferrer"
                                    className="bg-primary text-white size-8 rounded hover:bg-primary/90 flex items-center justify-center"
                                    title="Join Session"
                                >
                                    <Video className="size-4" />
                                </a>
                                <button className="size-8 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center hover:bg-slate-50">
                                    <Settings2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                        <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                            <VideoOff className="size-6" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900">No Sessions Found</h4>
                        <p className="text-slate-500 mt-1 text-sm max-w-sm mx-auto">There are no instructional sessions scheduled for the selected status.</p>
                        <button onClick={() => setFilter('Upcoming')} className="mt-6 text-sm font-medium text-primary bg-primary/10 px-5 py-2 rounded-md hover:bg-primary/20 transition-colors">
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Section */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4 text-slate-500">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Settings2 className="size-4 text-slate-400" />
                        <p className="text-xs font-medium">Broadcast Engine Active</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                        <Video className="size-4 text-slate-400" />
                        <p className="text-xs font-medium">Streaming Node Verified</p>
                    </div>
                </div>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md sm:rounded-lg border border-slate-200 p-6 bg-white shadow-lg shadow-slate-900/5">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Video className="size-5" />
                            </div>
                            <div className="text-left placeholder">
                                <DialogTitle className="text-lg font-bold text-slate-900">Schedule Session</DialogTitle>
                                <DialogDescription className="text-sm text-slate-500 mt-0.5">Initialize Academic Broadcast</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Academic Theme / Title</label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Advanced State Management"
                                className="h-9 px-3 rounded-md bg-white border-slate-200 focus:border-primary/50 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Associated Course</label>
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger className="h-9 px-3 rounded-md bg-white border-slate-200 focus:border-primary/50 text-sm">
                                    <SelectValue placeholder="Select an active course" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md border-slate-200">
                                    {courses?.map((c: any) => (
                                        <SelectItem 
                                            key={c.id} 
                                            value={c.id}
                                            className="py-1.5 focus:bg-slate-50 cursor-pointer"
                                        >
                                            <span className="text-sm">{c.title}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Date & Time</label>
                                <Input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    className="h-9 px-3 rounded-md bg-white border-slate-200 focus:border-primary/50 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Duration <span className="text-xs text-slate-500 font-normal">(min)</span></label>
                                <Input
                                    type="number"
                                    value={durationMinutes}
                                    onChange={e => setDurationMinutes(Number(e.target.value))}
                                    min="15" step="15"
                                    className="h-9 px-3 rounded-md bg-white border-slate-200 focus:border-primary/50 text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="h-9 px-4 rounded-md text-sm font-medium border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={createMutation.isPending || !title || !courseId || !scheduledAt}
                                onClick={() => createMutation.mutate()}
                                className="h-9 px-5 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {createMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing
                                    </div>
                                ) : 'Schedule'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
