import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronRight, Plus, Video, FileText, HelpCircle, MoreHorizontal } from 'lucide-react';
import { SortableLesson } from './SortableLesson';
import type { Lesson, Module } from './types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  module: Module;
  index: number;
  onDelete: (moduleId: string) => void;
  onAddLesson: (moduleId: string, type: 'video' | 'pdf') => void;
  onDeleteLesson: (lessonId: string, moduleId: string) => void;
  onLessonsReorder: (moduleId: string, lessons: Lesson[]) => void;
  onAddQuiz: (moduleId: string) => void;
}

export function SortableModule({
  module,
  index,
  onDelete,
  onAddLesson,
  onDeleteLesson,
  onLessonsReorder,
  onAddQuiz,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 0,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleLessonDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
      const newIndex = module.lessons.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(module.lessons, oldIndex, newIndex).map((l, i) => ({
        ...l,
        orderIndex: (i + 1) * 10,
      }));
      onLessonsReorder(module.id, reordered);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-2xl border-slate-200 shadow-sm overflow-hidden group/module transition-[background-color,border-color,box-shadow] duration-300",
        isDragging && "shadow-lg ring-1 ring-primary/20",
        !collapsed && "shadow-md"
      )}
    >
      {/* Module Header */}
      <div className={cn(
        "flex items-center gap-4 p-5 transition-colors duration-300",
        !collapsed ? "bg-slate-50/50 border-b border-slate-100" : "hover:bg-slate-50/30"
      )}>
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors p-2 touch-none shrink-0"
        >
          <GripVertical className="size-5" />
        </button>

        <div
          className="size-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0 cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={() => setCollapsed(!collapsed)}>
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary bg-primary/5">
              Module
            </Badge>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
              {module.lessons.length} Content Items
            </span>
          </div>
          <p className="text-base font-semibold text-slate-900 truncate tracking-tight">{module.title}</p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="size-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-lg text-slate-500 hover:text-primary transition-colors">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg p-1.5 shadow-xl border-slate-200 font-sans">
              <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-1.5">
                Module Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onAddLesson(module.id, 'video')}
                className="rounded-md px-3 py-2 text-sm font-medium gap-2.5 focus:bg-primary/5 focus:text-primary"
              >
                <Video size={16} strokeWidth={2} />
                Add Video Lesson
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddLesson(module.id, 'pdf')}
                className="rounded-md px-3 py-2 text-sm font-medium gap-2.5 focus:bg-amber-50 focus:text-amber-700"
              >
                <FileText size={16} strokeWidth={2} />
                Add PDF Resource
              </DropdownMenuItem>
              {!module.quiz && (
                <DropdownMenuItem
                  onClick={() => onAddQuiz(module.id)}
                  className="rounded-md px-3 py-2 text-sm font-medium gap-2.5 focus:bg-slate-100 focus:text-slate-900"
                >
                  <HelpCircle size={16} strokeWidth={2} />
                  New Module Quiz
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="mx-2 my-1.5 bg-slate-100" />
              <DropdownMenuItem
                onClick={() => onDelete(module.id)}
                className="rounded-md px-3 py-2 text-sm font-medium gap-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
              >
                <Trash2 size={16} strokeWidth={2} />
                Delete Module
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Module Content */}
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
      )}>
        <div className="overflow-hidden">
          <div className="p-6 pt-5 space-y-5">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
              <SortableContext items={module.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {module.lessons.map((lesson) => (
                    <SortableLesson
                      key={lesson.id}
                      lesson={lesson}
                      onDelete={() => onDeleteLesson(lesson.id, module.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {module.lessons.length === 0 && (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl">
                <div className="size-12 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                  <Plus size={24} />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">No Content</p>
                <p className="text-sm text-slate-500 mt-1">Start by adding your first lesson</p>
              </div>
            )}

            {!collapsed && (
              <div className="flex justify-center gap-3 pt-2">
                <Button
                  onClick={() => onAddLesson(module.id, 'video')}
                  variant="outline"
                  className="h-9 rounded-md px-4 gap-2 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 hover:text-primary transition-colors"
                >
                  <Plus size={14} strokeWidth={2} />
                  Quick Add Lesson
                </Button>
                {!module.quiz && (
                  <Button
                    onClick={() => onAddQuiz(module.id)}
                    variant="outline"
                    className="h-9 rounded-md px-4 gap-2 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                  >
                    <Plus size={14} strokeWidth={2} />
                    Quick Add Quiz
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
