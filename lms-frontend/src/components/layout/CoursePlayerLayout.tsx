'use client';

import { Search, Bell, Menu, X, Terminal, ChevronRight, ChevronLeft, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import { useAuthStore } from '@/stores/auth.store';

interface CoursePlayerLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  courseTitle?: string;
}

export function CoursePlayerLayout({ children, sidebar, courseTitle }: CoursePlayerLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCourseSidebarVisible, setIsCourseSidebarVisible] = useState(true);
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toUpperCase();
  const isStudent = role === 'STUDENT' || role === 'USER';
  const isAdmin = role === 'ADMIN';

  return (
    <div className={cn(
      "flex flex-col bg-bg-page font-sans text-text-primary",
      isStudent && !isAdmin && "-mt-8 -mx-8"
    )}>

      <div className="flex flex-1">
        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-visible relative">

          {/* Re-open Sidebar Button (Floating) */}
          {!isCourseSidebarVisible && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCourseSidebarVisible(true)}
              className="hidden lg:flex fixed right-6 top-20 z-30 shadow-xl border border-primary/20 hover:border-primary/40 gap-2 items-center font-bold px-4 h-10 group bg-white/80 backdrop-blur-md"
            >
              <PanelRight className="size-4 text-primary group-hover:scale-110 transition-transform" />
              <span>Show Curriculum</span>
            </Button>
          )}

          <div className="max-w-none px-6 py-6 overflow-hidden">
            {children}
          </div>
        </main>

        {/* Sticky Right Sidebar (Desktop) - Stops before footer */}
        <aside className={cn(
          "hidden lg:flex flex-col border-l border-border bg-white sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar z-20 transition-all duration-300 ease-in-out shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.02)] self-start",
          isCourseSidebarVisible ? "w-[380px] opacity-100" : "w-0 opacity-0 border-l-0"
        )}>
          {React.isValidElement(sidebar)
            ? React.cloneElement(sidebar as React.ReactElement<any>, {
              onToggle: () => setIsCourseSidebarVisible(false)
            })
            : sidebar}
        </aside>

        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-60">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            <aside className="absolute right-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                {sidebar}
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation (Optional fallback) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-2 flex items-center justify-between z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Button variant="ghost" className="flex flex-col gap-1 h-auto py-1">
          <Terminal className={cn("size-5", isAdmin ? "text-amber-500" : "text-primary")} />
          <span className="text-[10px] font-bold uppercase">{isAdmin ? 'Preview' : 'Learn'}</span>
        </Button>
        <Button variant="ghost" className="flex flex-col gap-1 h-auto py-1 text-text-muted">
          <Menu className="size-5" />
          <span className="text-[10px] font-bold uppercase">Modules</span>
        </Button>
        <Button variant="ghost" className="flex flex-col gap-1 h-auto py-1 text-text-muted">
          <Bell className="size-5" />
          <span className="text-[10px] font-bold uppercase">Alerts</span>
        </Button>
        <div className={cn(
          "size-8 rounded-full border flex items-center justify-center overflow-hidden",
          isAdmin ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-primary/10 border-primary/20 text-primary"
        )}>
          <span className="text-[10px] font-bold">{isAdmin ? 'AD' : user?.name?.substring(0,2).toUpperCase() || 'ST'}</span>
        </div>
      </div>
    </div>
  );
}
