import { cn } from '@/lib/utils';
import { CheckCircle2, Target, Award, Star } from 'lucide-react';

interface OutcomeCardProps {
  outcomes: string[];
  title?: string;
  variant?: 'default' | 'premium';
  className?: string;
}

export function OutcomeCard({
  outcomes,
  title = "Learning Outcomes",
  variant = 'default',
  className,
}: OutcomeCardProps) {
  return (
    <div className={cn(
      'p-8 rounded-[32px] border transition-all duration-500',
      variant === 'premium' 
        ? 'bg-slate-900 text-white border-slate-800 shadow-2xl shadow-slate-900/20' 
        : 'bg-white text-slate-900 border-slate-100 shadow-sm',
      className
    )}>
      <div className="flex items-center gap-4 mb-8">
        <div className={cn(
          'size-12 rounded-[20px] flex items-center justify-center',
          variant === 'premium' ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
        )}>
          {variant === 'premium' ? <Award size={24} /> : <Target size={24} />}
        </div>
        <div>
          <h3 className={cn(
            'text-xl font-black tracking-tight',
            variant === 'premium' ? 'text-white' : 'text-slate-900'
          )}>
            {title}
          </h3>
          <p className={cn(
            'text-[10px] font-bold uppercase tracking-widest mt-0.5',
            variant === 'premium' ? 'text-slate-400' : 'text-slate-400'
          )}>
            Knowledge Domain Matrix
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {outcomes.map((outcome, index) => (
          <div key={index} className="flex gap-4 group">
            <div className="shrink-0 mt-1">
              <CheckCircle2 size={18} className={cn(
                'transition-transform group-hover:scale-110',
                variant === 'premium' ? 'text-primary' : 'text-primary'
              )} />
            </div>
            <p className={cn(
              'text-sm font-bold tracking-tight leading-relaxed',
              variant === 'premium' ? 'text-slate-300' : 'text-slate-600'
            )}>
              {outcome}
            </p>
          </div>
        ))}
      </div>
      
      {variant === 'premium' && (
        <div className="mt-10 pt-8 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Premium Professional Content</span>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-white hover:text-primary transition-colors">
            View Syllabus
          </button>
        </div>
      )}
    </div>
  );
}
