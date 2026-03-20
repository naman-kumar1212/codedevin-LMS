'use client';

import { useAuthStore } from '@/stores/auth.store';
import { 
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GlobalSearchModal from '../admin/GlobalSearchModal';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminTopbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const res = await api.getUnreadNotificationsCount();
        return res.data;
      } catch (err) {
        return 0;
      }
    },
    refetchInterval: 30000, 
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30 font-sans">
        {/* Left: Search Bar Trigger */}
        <div 
          className="relative flex-1 max-w-md group cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-11 pl-12 pr-4 text-xs font-bold text-slate-400 hover:bg-white hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center justify-between">
            <span className="uppercase tracking-widest">Search Intelligence (⌘K)</span>
            <Badge variant="secondary" className="text-[10px] font-black px-2 py-0.5 h-6 bg-white border-slate-200 text-slate-400 group-hover:text-primary rounded-lg shadow-sm">⌘K</Badge>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <Link href="/admin/notifications">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl group transition-all">
              <Bell size={20} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white shadow-sm" />
              )}
            </Button>
          </Link>

          <div className="h-8 w-px bg-border/60" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 cursor-pointer group outline-none">
                <Avatar className="size-10 rounded-xl border border-border shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-foreground leading-tight">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">System Admin</p>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-1" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-72 rounded-[1.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-slate-100 animate-in fade-in zoom-in-95 duration-500">
              <DropdownMenuLabel className="px-4 py-4 border-b border-slate-100 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 leading-none">Institutional Identity</p>
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user?.email || 'admin@codedevin.com'}</p>
              </DropdownMenuLabel>
              
              <DropdownMenuItem asChild className="rounded-xl outline-none">
                <Link 
                  href="/admin/profile" 
                  className="flex items-center gap-3 px-3 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-primary transition-all w-full"
                >
                  <div className="size-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <User size={16} />
                  </div>
                  Personal Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl outline-none">
                <Link 
                  href="/admin/settings" 
                  className="flex items-center gap-3 px-3 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-primary transition-all w-full"
                >
                  <div className="size-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <Settings size={16} />
                  </div>
                  System Governance
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 mx-1 my-2" />

              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-destructive focus:bg-red-50 focus:text-red-600 cursor-pointer flex items-center gap-3 outline-none"
              >
                <div className="size-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 transition-colors">
                  <LogOut size={16} />
                </div>
                Sign Out Registry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
