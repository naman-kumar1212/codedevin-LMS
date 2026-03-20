import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ChevronRight, Table as TableIcon } from 'lucide-react';

export interface Column<T = any> {
  key?: string;
  title?: string;
  header?: string; // fallback for title
  render?: (value: any, row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode; // fallback for render
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available',
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('rounded-[2rem] border border-border/50 overflow-hidden bg-white shadow-sm', className)}>
        <TableComponent>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/40">
              {columns.map((col, index) => (
                <TableHead
                  key={col.key || `skeleton-head-${index}`}
                  className={cn('h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60', col.headerClassName)}
                >
                  {col.title || col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-row-${i}`} className="hover:bg-transparent border-b border-border/20 last:border-0">
                {columns.map((col, j) => (
                  <TableCell key={`skeleton-cell-${i}-${j}`} className="py-5">
                    <Skeleton className="h-4 w-full max-w-[120px] rounded-lg opacity-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TableComponent>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={cn('rounded-[2rem] border border-border/50 overflow-hidden bg-white shadow-sm', className)}>
        <div className="py-24 text-center animate-in fade-in duration-700">
          <div className="size-16 bg-muted/40 rounded-3xl mx-auto mb-4 flex items-center justify-center text-muted-foreground/20">
            <TableIcon size={32} />
          </div>
          <p className="text-sm font-black text-foreground tracking-tight">{emptyMessage}</p>
          <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">Registry is currently empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-[2rem] border border-border/50 overflow-hidden bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/40', className)}>
      <TableComponent>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-slate-50/50 border-b border-border/40">
            {columns.map((col, index) => (
              <TableHead
                key={col.key || `head-${index}`}
                className={cn('h-14 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400', col.headerClassName)}
              >
                {col.header || col.title}
              </TableHead>
            ))}
            {onRowClick && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={row.id || `row-${i}`}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'group transition-all duration-300 border-b border-border/20 last:border-0',
                onRowClick && 'cursor-pointer hover:bg-slate-50',
                typeof rowClassName === 'function' ? rowClassName(row, i) : rowClassName
              )}
            >
              {columns.map((col, j) => (
                <TableCell 
                  key={col.key || `cell-${i}-${j}`} 
                  className={cn(
                    'py-5 text-sm font-semibold tracking-tight text-slate-600 transition-colors group-hover:text-slate-900', 
                    col.className
                  )}
                >
                  {col.cell
                    ? col.cell(row)
                    : col.render
                    ? col.render(col.key ? row[col.key] : undefined, row)
                    : col.key
                    ? row[col.key]
                    : null}
                </TableCell>
              ))}
              {onRowClick && (
                <TableCell className="w-10 text-right pr-6">
                  <ChevronRight size={16} className="text-muted-foreground/20 transition-all duration-300 transform group-hover:text-primary group-hover:translate-x-1" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </TableComponent>
    </div>
  );
}
