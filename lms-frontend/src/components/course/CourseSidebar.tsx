'use client';

import { 
  Play, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Clock, 
  ChevronLeft,
  ArrowRight,
  FileText,
  FileQuestion
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'quiz';
  completed: boolean;
  active?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  questions: any[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz?: Quiz;
}

interface CourseSidebarProps {
  progress: number;
  modules: Module[];
  isAdmin?: boolean;
  onLessonClick?: (lessonId: string) => void;
  onQuizClick?: (quizId: string) => void;
  onNextLesson?: () => void;
  onToggle?: () => void;
}

export function CourseSidebar({ progress, modules, isAdmin, onLessonClick, onQuizClick, onNextLesson, onToggle }: CourseSidebarProps) {

  return (
    <div className="flex flex-col h-full bg-white border-r border-border font-sans overflow-hidden">
      {/* Progress Header */}
      <div className="p-6 border-b border-border space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-bold text-base text-foreground tracking-tight">
              {isAdmin ? 'Course Content' : 'Course Curriculum'}
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {isAdmin ? 'Curriculum Overview' : 'Your Learning Journey'}
            </p>
          </div>
          
          {onToggle && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggle}
              className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
        </div>

        {!isAdmin && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-muted-foreground uppercase tracking-wider">Overall Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Module List with ScrollArea */}
      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={[modules[0]?.id]} className="w-full">
          {modules.map((module, idx) => (
            <AccordionItem key={module.id} value={module.id} className="border-b border-border/60 last:border-0 px-2">
              <AccordionTrigger className="hover:no-underline py-4 px-4 rounded-xl hover:bg-muted/50 transition-all group">
                <div className="flex flex-col items-start gap-1 text-left">
                   <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded tracking-tighter uppercase">
                      Module {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground tracking-tight">
                      {module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                    {module.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-2">
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const Icon = lesson.type === 'video' ? Play : lesson.type === 'pdf' ? FileText : lesson.type === 'quiz' ? FileQuestion : BookOpen;
                    
                    return (
                      <div 
                        key={lesson.id}
                        onClick={() => onLessonClick?.(lesson.id)}
                        className={cn(
                          "group relative flex flex-col gap-1.5 p-3.5 rounded-xl cursor-pointer transition-all border border-transparent mx-2",
                          lesson.active 
                            ? "bg-primary/5 border-primary/20 shadow-sm" 
                            : "hover:bg-muted/50 hover:border-border"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "mt-0.5 size-5 rounded-md flex items-center justify-center transition-colors shrink-0",
                            lesson.completed ? "bg-emerald-500/10 text-emerald-500" : 
                            lesson.active ? "bg-primary text-white shadow-md shadow-primary/20" : 
                            "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
                          )}>
                            {lesson.completed ? (
                              <CheckCircle2 className="size-3.5" strokeWidth={3} />
                            ) : (
                              <Icon className="size-3" strokeWidth={lesson.active ? 3 : 2.5} />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "text-xs leading-tight tracking-tight",
                              lesson.active ? "font-bold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"
                            )}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {lesson.type !== 'pdf' && lesson.duration && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70 tracking-tight">
                                  <Clock className="size-2.5" />
                                  {lesson.duration}
                                </span>
                              )}
                              <Badge variant="outline" className={cn(
                                "text-[9px] h-4 font-black uppercase tracking-widest px-1 py-0 border-0",
                                lesson.active ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                              )}>
                                {lesson.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {lesson.active && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
                        )}
                      </div>
                    );
                  })}

                  {module.quiz && (
                    <div 
                      onClick={() => onQuizClick?.(module.quiz!.id)}
                      className="group relative flex flex-col gap-1.5 p-3.5 rounded-xl border border-transparent mx-2 hover:bg-indigo-50/60 hover:border-indigo-200/60 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 size-5 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 shrink-0">
                          <FileQuestion className="size-3" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground leading-tight tracking-tight">
                            {module.quiz.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <Badge variant="outline" className="text-[9px] h-4 font-black uppercase tracking-widest px-1 py-0 border-0 bg-indigo-100/80 text-indigo-600">
                              Quiz · {module.quiz.questions?.length || 0} Qs
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>

      {/* Bottom Action */}
      <div className="p-6 border-t border-border bg-white shrink-0">
        <Button 
          className="w-full h-11 rounded-xl flex items-center justify-center gap-3 font-bold text-sm tracking-tight shadow-xl shadow-primary/20 active:scale-[0.98] transition-all group"
          onClick={onNextLesson}
        >
          <span>Next Learning Chapter</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
