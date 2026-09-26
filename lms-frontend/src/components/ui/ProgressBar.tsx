import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'indigo';
}

const variantClass = {
  default: '[&>*]:bg-primary shadow-[0_0_8px_rgba(37,99,235,0.2)]',
  success: '[&>*]:bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
  warning: '[&>*]:bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
  error: '[&>*]:bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
  indigo: '[&>*]:bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.2)]',
};

const sizeClass = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  label,
  showValue = false,
  className,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-black text-slate-900 tabular-nums">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <Progress
          value={clamped}
          className={cn(
            'bg-slate-100 border border-slate-50',
            sizeClass[size],
            variantClass[variant as keyof typeof variantClass] || variantClass.default
          )}
        />
      </div>
    </div>
  );
}
