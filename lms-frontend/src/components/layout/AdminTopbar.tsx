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
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
          <div className="w-full bg-slate-50 border border-slate-200 rounded-md h-10 pl-10 pr-3 text-sm font-medium text-slate-500 hover:bg-white hover:border-primary/30 transition-colors flex items-center justify-between shadow-sm">
            <span>Search Intelligence...</span>
            <Badge variant="secondary" className="text-xs font-medium px-1.5 py-0.5 h-5 bg-white border-slate-200 text-slate-500 rounded shadow-sm">⌘K</Badge>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <Link href="/admin/notifications">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors">
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-white" />
              )}
            </Button>
          </Link>

          <div className="h-8 w-px bg-border/60" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 cursor-pointer group outline-none">
                <Avatar className="size-8 rounded-full border border-slate-200">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-slate-50 text-slate-600 font-medium text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500 mt-1">System Admin</p>
                </div>
                <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-600 transition-colors ml-1" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-md border-slate-200">
              <DropdownMenuLabel className="px-3 py-3 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.email || 'admin@codedevin.com'}</p>
                <p className="text-xs text-slate-500 mt-0.5">Institutional Identity</p>
              </DropdownMenuLabel>
              
              <DropdownMenuItem asChild className="rounded-md outline-none cursor-pointer">
                <Link 
                  href="/admin/profile" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors w-full"
                >
                  <User size={16} className="text-slate-400 group-hover:text-primary" />
                  Personal Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-md outline-none cursor-pointer mt-1">
                <Link 
                  href="/admin/settings" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors w-full"
                >
                  <Settings size={16} className="text-slate-400 group-hover:text-primary" />
                  System Governance
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 mx-1 my-1" />

              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer flex items-center gap-3 outline-none"
              >
                <LogOut size={16} className="text-red-500" />
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
