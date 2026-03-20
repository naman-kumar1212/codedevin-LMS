'use client';

import { useAuthStore } from '@/stores/auth.store';
import { 
  Search, 
  Bell, 
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function StudentTopbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Extract courseId if in a course-related path
  const courseId = pathname.startsWith('/course/') ? pathname.split('/')[2] : null;

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.getCourse(courseId!).then((r) => r.data),
    enabled: !!courseId,
  });

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    logout();
    router.push('/login');
  };

  // Get page title based on path
  const getPageTitle = () => {
    if (course && course.id === courseId) {
      return course.title;
    }
    
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'Dashboard';
    
    if (lastSegment === courseId && course?.title) {
        return course.title;
    }

    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30 font-sans">
      <div className="flex items-center gap-4 min-w-0">
        <h1 className="text-lg font-bold text-foreground tracking-tight truncate max-w-[300px] md:max-w-[500px]">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="relative group hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search lessons..." 
            className="w-[240px] h-10 pl-10 pr-4 rounded-xl bg-muted/30 border border-transparent text-sm focus:outline-none focus:bg-white focus:border-primary/20 transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl">
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive border-2 border-white" />
        </Button>

        <div className="h-8 w-px bg-border/60" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 cursor-pointer group outline-none">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-[10px] font-black text-foreground leading-tight uppercase tracking-widest">{user?.name?.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-emerald-500 leading-tight uppercase tracking-tighter">Active</p>
              </div>
              <Avatar className="size-9 rounded-xl border border-border shadow-sm group-hover:scale-105 transition-transform">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs uppercase">
                  {user?.name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            <DropdownMenuLabel className="px-4 py-4 border-b border-slate-100 mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Status: Enrolled Student</p>
              <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user?.email}</p>
            </DropdownMenuLabel>

            <DropdownMenuItem asChild className="rounded-xl outline-none">
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <User className="size-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">My Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="rounded-xl outline-none">
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Settings className="size-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="rounded-xl outline-none">
              <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <HelpCircle className="size-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Help Center</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100 mx-1 my-2" />

            <DropdownMenuItem 
              onClick={handleLogout}
              className="rounded-xl px-3 py-3 text-destructive focus:bg-red-50 focus:text-red-600 cursor-pointer flex items-center gap-3 transition-colors outline-none"
            >
              <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 transition-colors">
                <LogOut className="size-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.15em]">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
