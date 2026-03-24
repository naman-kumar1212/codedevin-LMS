'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface Option {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
}

interface QuizData {
  id: string;
  title: string;
  passingScore: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  questions: Question[];
}

interface QuizPlayerProps {
  quizId: string;
  isAdmin?: boolean;
  onComplete?: () => void;
}

export default function QuizPlayer({ quizId, isAdmin = false, onComplete }: QuizPlayerProps) {
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    isPassed: boolean;
    attemptsUsed: number;
    attemptsRemaining: number;
  } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await api.getQuizById(quizId);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentIdx < (data?.questions.length || 0) - 1) {
      setCurrentIdx(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
    }
  };

  const handleSubmit = async () => {
    if (!data) return;
    try {
      setIsSubmitting(true);
      const res = await api.submitQuizAttempt(quizId, answers);
      setResult(res.data);
      toast.success(res.data.isPassed ? 'Congratulations! You passed.' : 'Quiz completed.');
      onComplete?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="size-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground italic">Preparing your assessment...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="max-w-md mx-auto border-rose-100 bg-rose-50/30">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="size-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Quiz</h3>
          <p className="text-slate-600 mb-6">{error || 'Quiz data is unavailable'}</p>
          <Button onClick={() => window.location.reload()} className="bg-slate-900">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    const isSuccess = result.isPassed;
    return (
      <Card className="border-border/60 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-500 max-w-2xl mx-auto">
        <CardHeader className="text-center pt-12 pb-6">
          <div className={cn(
            "size-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 transition-transform hover:scale-110 duration-500",
            isSuccess ? "bg-emerald-50 text-emerald-500 shadow-emerald-100" : "bg-amber-50 text-amber-500 shadow-amber-100"
          )}>
            <Trophy className="size-12" />
          </div>
          <CardTitle className="text-3xl font-black text-foreground tracking-tight">
            {isSuccess ? "Mission Accomplished!" : "Keep Practicing!"}
          </CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground mt-2">
            Assessment Results for {data.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-12 pb-12 text-center">
          <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-2xl p-8 border border-border/50">
             <div className="text-center border-r border-border/50">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Score</p>
               <p className={cn(
                 "text-4xl font-black",
                 isSuccess ? "text-emerald-500" : "text-amber-500"
               )}>{result.score}%</p>
             </div>
             <div className="text-center">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Status</p>
               <p className={cn(
                 "text-xl font-black rounded-lg py-1 px-3 inline-block",
                 isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
               )}>
                 {isSuccess ? "PASSED" : "RETRY NEEDED"}
               </p>
             </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-[10px] px-3 py-1 uppercase tracking-widest font-black text-muted-foreground border-border/60">
              Attempts Used: {result.attemptsUsed}
            </Badge>
            {!isAdmin && (
              <Badge variant={result.attemptsRemaining > 0 ? "secondary" : "destructive"} className="text-[10px] px-3 py-1 uppercase tracking-widest font-black">
                {result.attemptsRemaining} Attempts Left
              </Badge>
            )}
            {isAdmin && (
              <Badge variant="outline" className="text-[10px] px-3 py-1 uppercase tracking-widest font-black text-primary border-primary/20 bg-primary/5">
                Admin Testing Mode
              </Badge>
            )}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {(isAdmin || result.attemptsRemaining > 0) && (
              <Button
                onClick={() => {
                  setResult(null);
                  setCurrentIdx(0);
                  setAnswers({});
                }}
                variant="outline"
                className="w-full sm:w-auto px-8 h-12 rounded-xl font-bold flex items-center gap-2 border-border/60 hover:bg-muted"
              >
                <RotateCcw className="size-4" />
                Retake Assessment
              </Button>
            )}
            <Button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-10 h-12 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20"
            >
              Back to Course
              <ArrowRight className="size-4 text-white/70" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = data.questions[currentIdx];
  const totalQuestions = data.questions.length;
  const progress = ((currentIdx + 1) / totalQuestions) * 100;
  const isLast = currentIdx === totalQuestions - 1;

  return (
    <Card className="border-border/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden font-sans max-w-3xl mx-auto border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-5 duration-500">
      <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between bg-muted/5 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Target className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg font-black tracking-tight truncate max-w-[200px] sm:max-w-none">{data.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
               <CardDescription className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md inline-block">
                Assessment In Progress
              </CardDescription>
              {isAdmin && (
                 <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">Admin View</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Question Progress</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm font-black text-foreground">{currentIdx + 1}</span>
            <span className="text-xs font-bold text-muted-foreground/40">/</span>
            <span className="text-sm font-black text-muted-foreground">{totalQuestions}</span>
          </div>
        </div>
      </CardHeader>
      
      <div className="px-8 pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Question {currentIdx + 1} Percentage</span>
          <span className="text-[10px] font-black text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 rounded-full" />
      </div>

      <CardContent className="p-8 pb-10">
        <div className="mb-10">
          <span className="text-[10px] font-black text-primary/50 uppercase tracking-[0.3em] mb-3 block">Question Statement</span>
          <h4 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
            {currentQuestion.questionText}
          </h4>
        </div>

        <div className="grid gap-4">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            const label = String.fromCharCode(65 + idx);
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                className={cn(
                  "group relative w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between isolate active:scale-[0.98] outline-none",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-2 ring-primary/10"
                    : "border-muted/60 hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "size-10 rounded-xl border-2 flex items-center justify-center font-black text-xs transition-all",
                    isSelected 
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/30" 
                      : "border-border bg-white text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
                  )}>
                    {label}
                  </div>
                  <span className={cn(
                    "font-bold text-base tracking-tight transition-colors",
                    isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>{option.optionText}</span>
                </div>
                {isSelected && (
                  <div className="bg-primary/10 size-9 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="size-6 text-primary" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="p-8 bg-muted/5 border-t border-border/40 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-1 w-full">
           <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-14 flex-1 sm:flex-none sm:min-w-[120px] rounded-2xl font-bold text-muted-foreground hover:text-foreground"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIdx === totalQuestions - 1 || !answers[currentQuestion.id]}
            className={cn(
              "h-14 flex-1 rounded-2xl font-black text-base transition-all gap-2",
              isLast ? "hidden" : "flex"
            )}
          >
            Continue
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {isLast && (
           <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < totalQuestions}
            className="w-full sm:w-auto sm:min-w-[200px] h-14 rounded-2xl font-black text-base shadow-2xl shadow-primary/20 gap-3 group transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Finalize & Score
                <CheckCircle2 className="size-5 opacity-70" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
