import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'secondary';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantMap: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  error:   'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
  info:    'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50',
  default: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10',
  secondary: 'bg-muted text-muted-foreground border-border hover:bg-muted',
};

export function StatusBadge({ children, variant = 'default', className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border',
        variantMap[variant],
        className
      )}
    >
      {children}
    </Badge>
  );
}
