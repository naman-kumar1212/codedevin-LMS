'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Video, FileText, Loader2, CheckCircle2, AlertCircle, Clock, Edit2 } from 'lucide-react';
import type { Lesson } from './types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  lesson: Lesson;
  onDelete: () => void;
  onEdit?: () => void;
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

export function SortableLesson({ lesson, onDelete, onEdit }: Props) {
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
        "flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-3.5 transition-[background-color,border-color,box-shadow] duration-200 group/lesson",
        "hover:border-slate-300 hover:shadow-sm"
      )}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors p-2 touch-none shrink-0"
      >
        <GripVertical size={16} />
      </button>

      {/* Type icon */}
      <div className={cn(
        "size-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
        typeInfo.bg,
      )}>
        <TypeIcon className={cn("size-5", typeInfo.color)} strokeWidth={2} />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {lesson.type}
          </span>
          <div className="size-1 rounded-full bg-slate-300" />
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest truncate">
            {lesson.id.slice(0, 8)}
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-900 truncate tracking-tight group-hover/lesson:text-primary transition-colors duration-200">
          {lesson.title || <span className="text-slate-400 font-medium italic">Untitled lesson</span>}
        </p>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium uppercase tracking-wider transition-all",
          (lesson.videoUrl || lesson.resourceUrl) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : statusInfo.badge
        )}
      >
        <StatusIcon className={cn("size-3.5", (lesson.videoUrl || lesson.resourceUrl) ? 'text-emerald-500' : statusInfo.className)} strokeWidth={2.5} />
        {(lesson.videoUrl || lesson.resourceUrl) ? 'Linked' : statusInfo.label}
      </Badge>

      {/* Delete / Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity shrink-0">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition-all"
          >
            <Edit2 size={16} strokeWidth={2} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-2 transition-all"
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
