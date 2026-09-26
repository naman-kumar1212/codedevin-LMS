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
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    icon: TrendingUp,
    label: 'Increase'
  },
  down: {
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    icon: TrendingDown,
    label: 'Decrease'
  },
  neutral: {
    color: 'text-slate-500 bg-slate-50 border-slate-100',
    icon: Minus,
    label: 'Stable'
  },
};

export function StatCard({ title, value, icon: Icon, change, trend = 'neutral', description, className }: StatCardProps) {
  const trendConfig = trendConfigs[trend];
  const TrendIcon = trendConfig.icon;

  return (
    <Card className={cn(
      'relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {value}
              </h3>
              {change && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
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
            'size-10 rounded-lg flex items-center justify-center',
            'bg-primary/10 border border-primary/20'
          )}>
            <Icon className="size-5 text-primary" strokeWidth={2} />
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
