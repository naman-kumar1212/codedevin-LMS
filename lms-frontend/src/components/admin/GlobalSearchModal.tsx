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
      <DialogContent className="p-0 max-w-2xl border bg-white shadow-xl rounded-xl overflow-hidden font-sans antialiased">
        <DialogTitle className="sr-only">Command Center</DialogTitle>
        <DialogDescription className="sr-only">Search the administrative registry for students, courses, or payments.</DialogDescription>
        <div className="relative flex items-center p-4 border-b border-slate-200 bg-slate-50/50">
          <Search size={20} className="text-primary mr-3" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search the registry..."
            className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-slate-900 placeholder:text-slate-400"
          />
          <div className="flex items-center gap-3">
            {isLoading && <Loader2 size={18} className="animate-spin text-primary" />}
            {query && !isLoading && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setQuery('')}
                className="size-7 rounded-md hover:bg-slate-200/50"
              >
                <X size={14} className="text-slate-500" />
              </Button>
            )}
            <Badge variant="outline" className="hidden sm:flex h-6 rounded px-1.5 font-medium text-[10px] text-slate-400 border-slate-200 bg-white">
              ESC
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-3">
            {!query ? (
              <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                <div className="size-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <CommandIcon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Global Command Center</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Instantly access students, curriculum details, or transactional records.
                </p>
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="py-16 text-center animate-in fade-in duration-300">
                <p className="text-base font-semibold text-slate-900">No results found</p>
                <p className="text-sm text-slate-500 mt-1">No matches found for "{query}".</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {['student', 'course', 'payment'].map((type) => {
                  const groupResults = results.filter(r => r.type === type);
                  if (groupResults.length === 0) return null;

                  return (
                    <div key={type} className="animate-in slide-in-from-left-1 duration-200">
                      <div className="flex items-center gap-2 px-3 mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          {type === 'student' ? 'Students' : type === 'course' ? 'Courses' : 'Payments'}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                      <div className="space-y-1">
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
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 text-left border",
                                isSelected 
                                  ? "bg-primary/5 border-primary/20" 
                                  : "bg-transparent border-transparent hover:bg-slate-50"
                              )}
                            >
                              <div className={cn(
                                "size-10 rounded-lg flex items-center justify-center transition-colors",
                                isSelected ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 group-hover:text-primary"
                              )}>
                                {type === 'student' && <Users size={18} />}
                                {type === 'course' && <BookOpen size={18} />}
                                {type === 'payment' && <CreditCard size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-semibold leading-tight truncate",
                                  isSelected ? "text-primary" : "text-slate-900"
                                )}>
                                  {result.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 truncate tracking-wide">
                                  {result.subtitle}
                                </p>
                              </div>
                              <ArrowRight
                                size={16}
                                className={cn(
                                  "transition-all duration-200",
                                  isSelected ? "text-primary translate-x-0 opacity-100" : "text-slate-300 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
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

        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-slate-400 rotate-180" /> <ArrowRight size={12} className="text-slate-400 rotate-0" /> Navigate</span>
            <span className="flex items-center gap-1.5"><span className="border border-slate-300 rounded px-1 bg-white">Enter</span> Select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
