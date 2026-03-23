import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  className?: string;
}

const trendConfigs = {
  up: {
    color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50',
    icon: TrendingUp,
    label: 'Increase'
  },
  down: {
    color: 'text-rose-600 bg-rose-50/50 border-rose-100/50',
    icon: TrendingDown,
    label: 'Decrease'
  },
  neutral: {
    color: 'text-slate-500 bg-slate-50/50 border-slate-100/50',
    icon: Minus,
    label: 'Stable'
  },
};

export function StatCard({ title, value, icon: Icon, change, trend = 'neutral', description, className }: StatCardProps) {
  const trendConfig = trendConfigs[trend];
  const TrendIcon = trendConfig.icon;

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-500 group',
      'bg-white/70 backdrop-blur-xl border-white/40 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1',
      'rounded-xl',
      className
    )}>
      {/* Decorative gradient blur */}
      <div className="absolute -right-4 -top-4 size-24 bg-primary/5 blur-3xl rounded-full transition-all duration-700 group-hover:bg-primary/10 group-hover:scale-150" />

      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors duration-500">
                {value}
              </h3>
              {change && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border border-transparent transition-all duration-500',
                    trendConfig.color
                  )}
                >
                  <TrendIcon size={12} className="mr-1 inline-block" strokeWidth={2.5} />
                  {change}
                </Badge>
              )}
            </div>
          </div>

          <div className={cn(
            'size-10 rounded-lg flex items-center justify-center transition-all duration-500',
            'bg-slate-50 border border-slate-100 group-hover:bg-primary group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20'
          )}>
            <Icon className="size-5 text-slate-400 group-hover:text-white transition-colors duration-500" strokeWidth={2} />
          </div>
        </div>

        {description && (
          <p className="mt-4 text-xs font-medium text-slate-500 tracking-tight leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
