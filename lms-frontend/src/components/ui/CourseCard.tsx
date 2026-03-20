'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Users, Clock, Star, PlayCircle, BarChart, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  instructor?: { name: string; avatar?: string };
  category?: string;
  level?: string;
  price?: number;
  isFree?: boolean;
  enrollments?: number;
  lessonsCount?: number;
  durationHours?: number;
  rating?: number;
  progress?: number; // student view — 0-100
  status?: 'draft' | 'published';
  href?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  instructor,
  category,
  level,
  price,
  isFree,
  enrollments,
  lessonsCount,
  durationHours,
  rating,
  progress,
  status,
  href,
  className,
}: CourseCardProps) {
  const cardContent = (
    <Card className={cn('group overflow-hidden hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] transition-all duration-700 flex flex-col h-full border-slate-100 rounded-[2.5rem] bg-white ring-1 ring-slate-100/50', className)}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <BookOpen className="size-14 text-slate-200" strokeWidth={1.5} />
          </div>
        )}
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

        {/* Level badge */}
        {level && (
          <div className="absolute top-5 left-5">
            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-[0.15em] bg-white/90 backdrop-blur-xl border-white/40 py-1.5 px-4 rounded-full shadow-lg text-slate-900">
              <BarChart size={12} className="mr-1.5 text-primary" />
              {level}
            </Badge>
          </div>
        )}

        {/* Status badge */}
        {status && (
          <div className="absolute top-5 right-5">
            <Badge
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.15em] py-1.5 px-4 rounded-full shadow-lg border-0",
                status === 'published' 
                  ? "bg-emerald-500/90 text-white backdrop-blur-md" 
                  : "bg-slate-900/90 text-white backdrop-blur-md"
              )}
            >
              <div className={cn("size-1.5 rounded-full mr-2 animate-pulse", status === 'published' ? "bg-white" : "bg-white/40")} />
              {status}
            </Badge>
          </div>
        )}

        {/* Progress overlay */}
        {progress != null && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-slate-950 via-slate-900/80 to-transparent">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-2">
                <PlayCircle size={14} className="text-primary fill-primary/20" />
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Ongoing Performance</span>
              </div>
              <span className="text-xs font-black text-white bg-primary px-2 py-0.5 rounded-md">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20 border-white/5 shadow-inner" />
          </div>
        )}
      </div>

      <CardContent className="flex-1 p-8 space-y-6">
        <div className="flex items-center gap-3">
          {category && (
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border-primary/10 rounded-lg px-2.5 py-1">
              {category}
            </Badge>
          )}
          <Separator orientation="vertical" className="h-3 bg-slate-200" />
          {lessonsCount != null && (
            <div className="flex items-center gap-1.5">
              <PlayCircle size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{lessonsCount} Units</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-black tracking-tight text-slate-900 line-clamp-2 leading-[1.15] group-hover:text-primary group-hover:translate-x-1 transition-all duration-500">
            {title}
          </h3>
          {description && (
            <p className="text-sm font-semibold text-slate-500/80 line-clamp-2 leading-relaxed italic">
              "{description}"
            </p>
          )}
        </div>

        {instructor && (
          <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
            <Avatar className="size-11 rounded-2xl ring-4 ring-slate-100/50 shadow-sm transition-transform group-hover:rotate-6">
              <AvatarImage src={instructor.avatar} className="object-cover" />
              <AvatarFallback className="text-sm font-black bg-primary/10 text-primary">
                {instructor.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chief Architect</p>
              <p className="text-base font-black text-slate-900 leading-none truncate tracking-tight">{instructor.name}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-8 pt-0 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Investment</span>
            <div className="text-2xl font-black text-slate-900 tracking-tighter">
              {isFree ? (
                <span className="text-emerald-500">FREE</span>
              ) : price != null ? (
                <span className="bg-linear-to-r from-slate-900 to-primary bg-clip-text text-transparent">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              ) : "TBD"}
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-8 bg-slate-100" />

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Retention</span>
            <div className="flex items-center gap-1 text-slate-900">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-black">{rating || "5.0"}</span>
            </div>
          </div>
        </div>

        <button className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-500 group/btn">
          <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </CardFooter>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block h-full outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-[2.5rem] transition-all">{cardContent}</Link>;
  }
  return cardContent;
}
