'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Users, BookOpen, CreditCard, ArrowRight, Loader2, Command as CommandIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'student' | 'course' | 'payment';
  url: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [studentsRes, coursesRes, paymentsRes] = await Promise.all([
        api.adminStudents(searchQuery),
        api.adminCourses(),
        api.adminPayments(),
      ]);

      const formattedResults: SearchResult[] = [];

      (studentsRes.data || []).slice(0, 3).forEach((s: any) => {
        formattedResults.push({
          id: s.id,
          title: s.user?.name || s.name,
          subtitle: s.user?.email || s.email,
          type: 'student',
          url: `/admin/students/${s.id}`,
        });
      });

      (coursesRes.data || [])
        .filter((c: any) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .forEach((c: any) => {
          formattedResults.push({
            id: c.id,
            title: c.title,
            subtitle: `${c.type} • ${c.status}`,
            type: 'course',
            url: `/admin/courses/${c.id}/edit`,
          });
        });

      (paymentsRes.data || [])
        .filter((p: any) =>
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.student?.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
        .forEach((p: any) => {
          formattedResults.push({
            id: p.id,
            title: `Order #${p.id.slice(-6).toUpperCase()}`,
            subtitle: `${p.student?.user?.name || 'Unknown'} • ${p.amount} ${p.currency}`,
            type: 'payment',
            url: `/admin/payments`,
          });
        });

      setResults(formattedResults);
      setActiveIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[activeIndex]) {
        router.push(results[activeIndex].url);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl border-none shadow-2xl rounded-[2rem] overflow-hidden font-sans antialiased bg-white">
        <DialogTitle className="sr-only">Command Center</DialogTitle>
        <DialogDescription className="sr-only">Search the administrative registry for students, courses, or payments.</DialogDescription>
        <div className="relative flex items-center p-6 border-b border-border bg-slate-50/20">
          <Search size={20} className="text-primary mr-4" strokeWidth={2.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search the administrative registry..."
            className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-foreground placeholder:text-muted-foreground/40"
          />
          <div className="flex items-center gap-3">
            {isLoading && <Loader2 size={18} className="animate-spin text-primary" />}
            {query && !isLoading && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setQuery('')}
                className="size-7 rounded-lg hover:bg-muted"
              >
                <X size={14} className="text-muted-foreground" />
              </Button>
            )}
            <Badge variant="outline" className="hidden sm:flex h-6 rounded-md px-1.5 font-black text-[10px] text-muted-foreground/60 border-border/40 bg-white">
              ESC
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4">
            {!query ? (
              <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div className="size-20 bg-muted/30 rounded-3xl flex items-center justify-center text-muted-foreground/20 mb-6 shadow-inner">
                  <CommandIcon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Global Command Center</h3>
                <p className="text-sm font-semibold text-muted-foreground/60 mt-1 max-w-xs">
                  Instantly access students, curriculum details, or transactional records.
                </p>
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="py-20 text-center animate-in fade-in duration-500">
                <p className="text-lg font-black text-foreground">Null results detected</p>
                <p className="text-sm font-semibold text-muted-foreground/60 mt-1">No matches found for "{query}" across the registry.</p>
              </div>
            ) : (
              <div className="space-y-6 py-2">
                {['student', 'course', 'payment'].map((type) => {
                  const groupResults = results.filter(r => r.type === type);
                  if (groupResults.length === 0) return null;

                  return (
                    <div key={type} className="animate-in slide-in-from-left-2 duration-300">
                      <div className="flex items-center gap-2 px-3 mb-3">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                          {type === 'student' ? 'Student Profiles' : type === 'course' ? 'Curriculum' : 'Transactions'}
                        </span>
                        <Separator className="flex-1 opacity-40" />
                      </div>
                      <div className="space-y-1.5 px-1">
                        {groupResults.map((result) => {
                          const globalIndex = results.indexOf(result);
                          const isSelected = globalIndex === activeIndex;

                          return (
                            <button
                              key={result.id}
                              onClick={() => {
                                router.push(result.url);
                                onClose();
                              }}
                              onMouseEnter={() => setActiveIndex(globalIndex)}
                              className={cn(
                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group text-left border border-transparent mb-1",
                                isSelected 
                                  ? "bg-primary border-primary/20 shadow-2xl shadow-primary/20 scale-[1.01] z-10" 
                                  : "hover:bg-slate-50"
                              )}
                            >
                              <div className={cn(
                                "size-11 rounded-xl flex items-center justify-center transition-all",
                                isSelected ? "bg-white/20 text-white rotate-2" : "bg-muted text-muted-foreground group-hover:text-primary group-hover:scale-110"
                              )}>
                                {type === 'student' && <Users size={20} />}
                                {type === 'course' && <BookOpen size={20} />}
                                {type === 'payment' && <CreditCard size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-black leading-tight truncate tracking-tight",
                                  isSelected ? "text-white" : "text-foreground"
                                )}>
                                  {result.title}
                                </p>
                                <p className={cn(
                                  "text-[10px] font-bold mt-1 truncate uppercase tracking-widest",
                                  isSelected ? "text-white/60" : "text-muted-foreground/60"
                                )}>
                                  {result.subtitle}
                                </p>
                              </div>
                              <ArrowRight
                                size={18}
                                className={cn(
                                  "transition-all duration-300",
                                  isSelected ? "text-white translate-x-0 opacity-100" : "text-muted-foreground/20 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                                )}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="bg-muted/30 px-6 py-3 border-t border-border flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><ArrowRight size={12} className="text-primary/40 rotate-180" /> <ArrowRight size={12} className="text-primary/40 rotate-0" /> Navigate</span>
            <span className="flex items-center gap-2 tracking-[0.3em] font-black underline underline-offset-4 decoration-primary/30">ENTER</span> to Select
          </div>
          <div className="flex items-center gap-1 opacity-40">
            Registry Search v1.0
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
