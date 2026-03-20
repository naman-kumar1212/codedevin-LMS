import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Lock, PlayCircle } from 'lucide-react';

export interface LessonItem {
  id: string;
  title: string;
  duration?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
  isActive?: boolean;
  type: 'video' | 'pdf';
}

export interface Section {
  id: string;
  title: string;
  lessons: LessonItem[];
}

interface LessonSidebarProps {
  sections: Section[];
  activeLessonId?: string;
  onLessonSelect?: (id: string) => void;
  className?: string;
}

export function LessonSidebar({
  sections,
  activeLessonId,
  onLessonSelect,
  className,
}: LessonSidebarProps) {
  return (
    <div className={cn('flex flex-col h-full bg-white border-r border-slate-100 w-80', className)}>
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Course Content</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium italic">Professional Curriculum Pathway</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            <div className="px-6 py-3 bg-slate-50/50 border-y border-slate-50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {section.title}
              </h3>
            </div>
            
            <div className="mt-1">
              {section.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => !lesson.isLocked && onLessonSelect?.(lesson.id)}
                  disabled={lesson.isLocked}
                  className={cn(
                    'w-full flex items-center gap-3 px-6 py-4 text-left transition-all relative group',
                    lesson.isActive 
                      ? 'bg-primary/5 text-primary' 
                      : 'hover:bg-slate-50 text-slate-600',
                    lesson.isLocked && 'opacity-60 cursor-not-allowed grayscale'
                  )}
                >
                  {lesson.isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                  )}
                  
                  <div className="shrink-0">
                    {lesson.isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : lesson.isLocked ? (
                      <Lock size={18} className="text-slate-300" />
                    ) : (
                      <div className={cn(
                        'size-5 rounded-full flex items-center justify-center border-2 transition-colors',
                        lesson.isActive ? 'border-primary' : 'border-slate-200 group-hover:border-slate-300'
                      )}>
                        {lesson.isActive ? (
                          <div className="size-2 rounded-full bg-primary" />
                        ) : (
                          <PlayCircle size={10} className="text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-sm font-bold tracking-tight leading-snug',
                      lesson.isActive ? 'text-primary' : 'text-slate-900'
                    )}>
                      {lesson.title}
                    </p>
                    {lesson.duration && (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        {lesson.type} • {lesson.duration}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
