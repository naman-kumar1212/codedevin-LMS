'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Video, FileText, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { Lesson } from './types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  lesson: Lesson;
  onDelete: () => void;
}

const statusConfig = {
  uploading: {
    icon: Loader2,
    label: 'Uploading',
    className: 'text-primary animate-spin',
    badge: 'bg-primary/5 text-primary border-primary/20'
  },
  processing: {
    icon: Clock,
    label: 'Processing',
    className: 'text-amber-500',
    badge: 'bg-amber-50 text-amber-600 border-amber-200'
  },
  ready: {
    icon: CheckCircle2,
    label: 'Live',
    className: 'text-emerald-500',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  failed: {
    icon: AlertCircle,
    label: 'Error',
    className: 'text-rose-500',
    badge: 'bg-rose-50 text-rose-600 border-rose-200'
  },
};

const typeConfig = {
  video: { icon: Video, color: 'text-primary', bg: 'bg-primary/10' },
  pdf: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100' },
  recording: { icon: Video, color: 'text-purple-500', bg: 'bg-purple-100' },
  resource: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100' },
};

export function SortableLesson({ lesson, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 60 : 0,
  };

  const statusInfo = statusConfig[lesson.status] ?? statusConfig.ready;
  const typeInfo = typeConfig[lesson.type] ?? typeConfig.video;
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 bg-white rounded-2xl border border-slate-200/60 p-4 transition-all duration-300 group/lesson",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5"
      )}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-2 touch-none shrink-0"
      >
        <GripVertical size={16} />
      </button>

      {/* Type icon */}
      <div className={cn(
        "size-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
        typeInfo.bg,
        "group-hover/lesson:scale-110 group-hover/lesson:shadow-lg group-hover/lesson:shadow-slate-100"
      )}>
        <TypeIcon className={cn("size-5", typeInfo.color)} strokeWidth={2.5} />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {lesson.type}
          </span>
          <div className="size-1 rounded-full bg-slate-200" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {lesson.id.slice(0, 8)}
          </p>
        </div>
        <p className="text-sm font-black text-slate-800 truncate tracking-tight group-hover/lesson:text-primary transition-colors duration-300">
          {lesson.title || <span className="text-slate-300 font-medium italic">Untitled lesson</span>}
        </p>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
          (lesson.videoUrl || lesson.resourceUrl) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : statusInfo.badge
        )}
      >
        <StatusIcon className={cn("size-3", (lesson.videoUrl || lesson.resourceUrl) ? 'text-emerald-500' : statusInfo.className)} strokeWidth={3} />
        {(lesson.videoUrl || lesson.resourceUrl) ? 'Linked' : statusInfo.label}
      </Badge>

      {/* Delete / Actions */}
      <button
        onClick={onDelete}
        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl p-2.5 transition-all opacity-0 group-hover/lesson:opacity-100 shrink-0"
      >
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
