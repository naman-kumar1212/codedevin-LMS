'use client';

import { useState } from 'react';
import { 
  Trophy, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  Target,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizContainerProps {
  questions: Question[];
  onComplete?: () => void;
}

export default function QuizContainer({ questions, onComplete }: QuizContainerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (selectedOption === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      onComplete?.();
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isSuccess = percentage >= 70;

    return (
      <Card className="border-border/60 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-500 max-w-2xl mx-auto">
        <CardHeader className="text-center pt-12 pb-6">
          <div className={cn(
            "size-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3",
            isSuccess ? "bg-emerald-50 text-emerald-500 shadow-emerald-100" : "bg-amber-50 text-amber-500 shadow-amber-100"
          )}>
            <Trophy className="size-12" />
          </div>
          <CardTitle className="text-3xl font-black text-foreground tracking-tight">
            {isSuccess ? "Mission Accomplished!" : "Solid Effort!"}
          </CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground mt-2">
            You've completed the knowledge check for this module.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-12 pb-12 text-center">
          <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
             <div className="flex items-center justify-center gap-8">
               <div className="text-center">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Score</p>
                 <p className="text-4xl font-black text-foreground">{score}<span className="text-muted-foreground/30 text-2xl">/{questions.length}</span></p>
               </div>
               <div className="w-px h-12 bg-border" />
               <div className="text-center">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Percentage</p>
                 <p className={cn(
                   "text-4xl font-black",
                   isSuccess ? "text-emerald-500" : "text-amber-500"
                 )}>{percentage}%</p>
               </div>
             </div>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => {
                setCurrentIdx(0);
                setScore(0);
                setIsFinished(false);
                setSelectedOption(null);
              }}
              variant="outline"
              className="w-full sm:w-auto px-8 h-12 rounded-xl font-bold flex items-center gap-2 border-border/60"
            >
              <RotateCcw className="size-4" />
              Retake Quiz
            </Button>
            <Button
              className="w-full sm:w-auto px-10 h-12 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20"
            >
              Continue Learning
              <ArrowRight className="size-4 text-white/70" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden font-sans max-w-3xl mx-auto border-t-4 border-t-primary">
      <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between bg-muted/5 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Target className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight">Quick Assessment</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md inline-block mt-1">
              Active Session
            </CardDescription>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Question Progress</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-foreground">{currentIdx + 1}</span>
            <span className="text-xs font-bold text-muted-foreground/40">of</span>
            <span className="text-sm font-black text-muted-foreground">{questions.length}</span>
          </div>
        </div>
      </CardHeader>
      
      <div className="px-8 pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completion Status</span>
          <span className="text-[10px] font-black text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <CardContent className="p-8 pb-10">
        <h4 className="text-xl font-bold text-foreground leading-tight mb-10 tracking-tight">
          {currentQuestion.text}
        </h4>

        <div className="grid gap-4">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const label = String.fromCharCode(65 + idx);
            
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={cn(
                  "group relative w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between isolate active:scale-[0.99]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                    : "border-muted/60 hover:border-primary/40 hover:bg-muted/20"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "size-9 rounded-xl border-2 flex items-center justify-center font-black text-xs transition-all",
                    isSelected 
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/30" 
                      : "border-border bg-white text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
                  )}>
                    {label}
                  </div>
                  <span className={cn(
                    "font-bold text-base tracking-tight transition-colors",
                    isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>{option}</span>
                </div>
                {isSelected && (
                  <div className="bg-primary/10 size-8 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="size-5 text-primary" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="p-8 bg-muted/5 border-t border-border/40">
        <Button
          onClick={handleNext}
          disabled={selectedOption === null}
          className="w-full h-14 rounded-2xl font-black text-base shadow-2xl shadow-primary/20 gap-3 group transition-all"
        >
          {currentIdx < questions.length - 1 ? (
            <>
              Next Challenge
              <ChevronRight className="size-5 transition-transform group-hover:translate-x-1 opacity-70" />
            </>
          ) : (
            <>
              Finish Knowledge Check
              <CheckCircle2 className="size-5 opacity-70" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
