import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'secondary' | 'destructive' | 'outline';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error:   'bg-red-50 text-red-700 border-red-200',
  info:    'bg-sky-50 text-sky-700 border-sky-200',
  default:
    "border-transparent bg-primary text-primary-foreground shadow",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground shadow",
  outline: "text-foreground border-border",
};

export function StatusBadge({ children, variant = 'default', className }: StatusBadgeProps) {
  return (
    <div className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-medium border tabular-nums whitespace-nowrap',
      variantStyles[variant],
      className
    )}>
      {children}
    </div>
  );
}
