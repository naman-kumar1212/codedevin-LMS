'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Users, Clock, Star, PlayCircle, BarChart, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThumbnailUrl } from '@/lib/image-utils';

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
  modulesCount?: number;
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
  modulesCount,
  durationHours,
  rating,
  progress,
  status,
  href,
  className,
}: CourseCardProps) {
  const cardContent = (
    <Card className={cn('group overflow-hidden flex flex-col h-full border-slate-200 rounded-2xl bg-white shadow-sm', className)}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={getThumbnailUrl(thumbnailUrl) || ''}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <BookOpen className="size-12 text-slate-200" strokeWidth={1.5} />
          </div>
        )}
        

        {/* Level badge */}
        {level && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md border shadow-sm py-1 px-3 rounded-md text-slate-700">
              {level}
            </Badge>
          </div>
        )}

        {/* Status badge */}
        {status && (
          <div className="absolute top-4 right-4">
            <Badge
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-md shadow-sm border-0",
                status === 'published' 
                  ? "bg-emerald-500 text-white" 
                  : "bg-slate-700 text-white"
              )}
            >
              {status}
            </Badge>
          </div>
        )}

        {/* Progress overlay */}
        {progress != null && (progress > 0) && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
              <span className="text-[10px] font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-100" />
          </div>
        )}
      </div>

      <CardContent className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border-primary/20 rounded py-0.5 px-2">
              {category}
            </Badge>
          )}
          {(lessonsCount != null || modulesCount != null) && (
            <div className="flex items-center gap-1.5 ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <PlayCircle size={14} className="text-slate-400" />
              <span>
                {modulesCount != null && `${modulesCount} ${modulesCount === 1 ? 'Module' : 'Modules'}`}
                {modulesCount != null && lessonsCount != null && ' · '}
                {lessonsCount != null && `${lessonsCount} ${lessonsCount === 1 ? 'Lesson' : 'Lessons'}`}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 line-clamp-2 leading-snug group-hover:text-primary">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {instructor && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
            <Avatar className="size-8 rounded-full shadow-sm">
              <AvatarImage src={instructor.avatar} className="object-cover" />
              <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-600">
                {instructor.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-none truncate">{instructor.name}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Instructor</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-slate-900">
            {isFree ? (
              <span className="text-emerald-600">Free</span>
            ) : price != null ? (
              <span>₹{price.toLocaleString('en-IN')}</span>
            ) : "TBD"}
          </div>
          
          {rating && (
            <div className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold">{rating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center text-xs font-bold text-primary">
          View Details <ChevronRight size={14} className="ml-1" />
        </div>
      </CardFooter>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block h-full outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-2xl transition-all">{cardContent}</Link>;
  }
  return cardContent;
}
