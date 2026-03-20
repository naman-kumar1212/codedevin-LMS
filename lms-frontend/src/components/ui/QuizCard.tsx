import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  type: 'multiple-choice' | 'single-choice';
}

interface QuizCardProps {
  question: QuizQuestion;
  selectedOptionIndex?: number;
  onOptionSelect: (index: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isLastQuestion?: boolean;
  currentIndex: number;
  totalQuestions: number;
  className?: string;
}

export function QuizCard({
  question,
  selectedOptionIndex,
  onOptionSelect,
  onNext,
  onPrevious,
  isLastQuestion,
  currentIndex,
  totalQuestions,
  className,
}: QuizCardProps) {
  return (
    <Card className={cn('max-w-3xl mx-auto rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden', className)}>
      <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
             Assessment Module
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 shadow-[0_0_8px_rgba(37,99,235,0.3)]"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-10">
        <h2 className="text-2xl font-black text-slate-900 mb-10 tracking-tight leading-tight">
          {question.question}
        </h2>
        
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onOptionSelect(index)}
              className={cn(
                'w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-5 group',
                selectedOptionIndex === index
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5 translate-x-1'
                  : 'border-slate-50 bg-slate-50/30 hover:border-slate-200 hover:bg-white active:scale-[0.99]'
              )}
            >
              <div className={cn(
                'size-8 rounded-xl flex items-center justify-center text-xs font-black transition-all',
                selectedOptionIndex === index
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                  : 'bg-white border border-slate-200 text-slate-400 group-hover:text-slate-600'
              )}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className={cn(
                'text-base font-bold tracking-tight',
                selectedOptionIndex === index ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
              )}>
                {option}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 h-12 px-6"
          >
            Go Back
          </Button>
          
          <Button
            onClick={onNext}
            className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-10 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
          >
            {isLastQuestion ? 'Submit Audit' : 'Proceed Forward'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
