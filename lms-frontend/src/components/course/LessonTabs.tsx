'use client';

import React, { useState } from 'react';
import {
  Info,
  MessageSquare,
  Pencil,
  Mail,
  ExternalLink,
  Clock,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface LessonTabsProps {
  description: string;
  instructor: {
    name: string;
    role?: string;
    avatar?: string;
  };
  /** When true, only Overview and Q&A are shown (no Notes for PDF lessons) */
  isPdf?: boolean;
}

export function LessonTabs({ description, instructor, isPdf = false }: LessonTabsProps) {
  const [noteContent, setNoteContent] = useState('');

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden font-sans">
      <Tabs defaultValue="overview" className="w-full">
        {/* Tab bar — line variant with bottom border separator */}
        <div className="border-b border-border px-4">
          <TabsList className="h-auto bg-transparent gap-0 p-0 w-full justify-start rounded-none">
            <TabsTrigger
              value="overview"
              className={cn(
                "relative h-12 px-4 gap-2 rounded-none border-0 bg-transparent text-xs font-semibold uppercase tracking-widest text-muted-foreground",
                "data-active:text-primary data-active:shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:opacity-0 data-active:after:opacity-100 after:transition-opacity after:rounded-t-full"
              )}
            >
              <Info className="size-3.5" />
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="qa"
              className={cn(
                "relative h-12 px-4 gap-2 rounded-none border-0 bg-transparent text-xs font-semibold uppercase tracking-widest text-muted-foreground",
                "data-active:text-primary data-active:shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:opacity-0 data-active:after:opacity-100 after:transition-opacity after:rounded-t-full"
              )}
            >
              <MessageSquare className="size-3.5" />
              Q&amp;A
            </TabsTrigger>

            {/* Notes only for non-PDF lessons */}
            {!isPdf && (
              <TabsTrigger
                value="notes"
                className={cn(
                  "relative h-12 px-4 gap-2 rounded-none border-0 bg-transparent text-xs font-semibold uppercase tracking-widest text-muted-foreground",
                  "data-active:text-primary data-active:shadow-none",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:opacity-0 data-active:after:opacity-100 after:transition-opacity after:rounded-t-full"
                )}
              >
                <Pencil className="size-3.5" />
                Notes
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* ── Overview ─────────────────────────────────────── */}
          <TabsContent value="overview" className="mt-0 space-y-6 animate-in fade-in duration-300">
            {/* Instructor card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <Avatar className="size-12 rounded-xl border border-border shadow-sm">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-base uppercase">
                  {instructor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Instructor
                </p>
                <p className="font-semibold text-foreground text-sm truncate">{instructor.name}</p>
                <p className="text-xs text-muted-foreground">{instructor.role || 'Course Expert'}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-primary text-xs font-semibold"
                >
                  <ExternalLink className="size-3.5" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg border-border/60 hover:text-primary hover:bg-primary/5"
                >
                  <Mail className="size-3.5" />
                </Button>
              </div>
            </div>

            <Separator className="opacity-40" />

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground tracking-tight">About this lesson</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description || 'No description provided for this lesson.'}
              </p>
            </div>
          </TabsContent>

          {/* ── Q&A ──────────────────────────────────────────── */}
          <TabsContent value="qa" className="mt-0 animate-in fade-in duration-300">
            <ComingSoonState
              icon={<MessageSquare className="size-6 text-muted-foreground/50" />}
              title="Q&A Discussion"
              description="Ask questions and get answers from instructors and fellow learners. Launching soon."
            />
          </TabsContent>

          {/* ── Notes (video lessons only) ────────────────────── */}
          {!isPdf && (
            <TabsContent value="notes" className="mt-0 animate-in fade-in duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Your notes are private and saved locally
                  </span>
                </div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your notes here… capture key concepts, timestamps, or anything worth remembering."
                  className={cn(
                    "w-full min-h-[180px] p-4 text-sm text-foreground placeholder:text-muted-foreground/60",
                    "bg-muted/20 border border-border rounded-xl resize-none outline-none",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all",
                    "leading-relaxed font-normal"
                  )}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {noteContent.length} characters
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 text-xs font-semibold rounded-lg border-border/60"
                    disabled={!noteContent.trim()}
                    onClick={() => {
                      const blob = new Blob([noteContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'lesson-notes.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export Notes
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}

/* ─── Helper ─────────────────────────────────────────── */
function ComingSoonState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center animate-in fade-in duration-500">
      <div className="size-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center mb-4">
        {icon}
      </div>
      <Badge
        variant="outline"
        className="mb-3 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5 px-3 py-0.5"
      >
        Coming Soon
      </Badge>
      <h4 className="text-base font-semibold text-foreground mb-2 tracking-tight">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
