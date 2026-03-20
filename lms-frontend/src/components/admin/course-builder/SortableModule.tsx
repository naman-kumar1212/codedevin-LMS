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
    useSensor(PointerSensor),
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
        "bg-white rounded-[2.5rem] border-slate-200/60 shadow-sm overflow-hidden group/module transition-all duration-500",
        isDragging && "shadow-2xl shadow-primary/20 ring-2 ring-primary/20",
        !collapsed && "shadow-xl shadow-slate-200/40"
      )}
    >
      {/* Module Header */}
      <div className={cn(
        "flex items-center gap-4 p-6 transition-colors duration-500",
        !collapsed ? "bg-slate-50/50" : "hover:bg-slate-50/30"
      )}>
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-2 touch-none shrink-0"
        >
          <GripVertical className="size-5" />
        </button>

        <div
          className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0 cursor-pointer shadow-sm shadow-primary/5"
          onClick={() => setCollapsed(!collapsed)}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={() => setCollapsed(!collapsed)}>
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/2">
              Module
            </Badge>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {module.lessons.length} Content Items
            </span>
          </div>
          <p className="text-base font-black text-slate-900 truncate tracking-tight">{module.title}</p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="size-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-white border-transparent hover:border-slate-200 transition-all border"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10 rounded-2xl text-slate-400 hover:text-primary transition-all">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-200 font-sans">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">
                Module Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onAddLesson(module.id, 'video')}
                className="rounded-xl px-3 py-2.5 text-sm font-bold gap-3 focus:bg-primary/5 focus:text-primary"
              >
                <Video size={16} strokeWidth={2.5} />
                Add Video Lesson
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddLesson(module.id, 'pdf')}
                className="rounded-xl px-3 py-2.5 text-sm font-bold gap-3 focus:bg-amber-50 focus:text-amber-600"
              >
                <FileText size={16} strokeWidth={2.5} />
                Add PDF Resource
              </DropdownMenuItem>
              {!module.quiz && (
                <DropdownMenuItem
                  onClick={() => onAddQuiz(module.id)}
                  className="rounded-xl px-3 py-2.5 text-sm font-bold gap-3 focus:bg-slate-50 focus:text-slate-900 underline-offset-4"
                >
                  <HelpCircle size={16} strokeWidth={2.5} />
                  New Module Quiz
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="mx-2 my-2 bg-slate-100" />
              <DropdownMenuItem
                onClick={() => onDelete(module.id)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold gap-3 text-rose-500 focus:bg-rose-50 focus:text-rose-600"
              >
                <Trash2 size={16} strokeWidth={2.5} />
                Delete Module
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Module Content */}
      <div className={cn(
        "grid transition-all duration-500 ease-in-out",
        collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
      )}>
        <div className="overflow-hidden">
          <div className="p-8 pt-4 space-y-6">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
              <SortableContext items={module.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
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
              <div className="py-12 text-center border-2 border-dashed border-slate-100 bg-slate-50/30 rounded-[2rem] animate-in fade-in duration-700">
                <div className="size-16 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
                  <Plus size={32} />
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No Content Added</p>
                <p className="text-xs font-bold text-slate-400 mt-2">Start by adding your first lesson</p>
              </div>
            )}

            {!collapsed && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => onAddLesson(module.id, 'video')}
                  variant="outline"
                  className="h-10 rounded-full px-6 gap-2 text-[10px] font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all"
                >
                  <Plus size={14} strokeWidth={3} />
                  Quick Add Lesson
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
