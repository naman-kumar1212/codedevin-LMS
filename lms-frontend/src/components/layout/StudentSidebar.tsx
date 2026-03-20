'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Video,
  Award,
  Bell,
  Settings,
  CircleHelp,
  LogOut,
  Terminal
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/courses', label: 'Browse Courses', icon: Search },
  { href: '/live-classes', label: 'Live Classes', icon: Video },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) { }
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-[240px] border-r border-border bg-card fixed left-0 top-0 h-full z-40 flex flex-col font-sans">
      {/* Branding */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary/90 transition-all">
            <Terminal size={18} />
          </div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            Codedevin<span className="text-primary">.</span>
          </h2>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3 custom-scrollbar">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'w-full justify-start gap-3 h-11 px-3 font-medium transition-all relative',
                  active 
                    ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className={cn('size-[18px] shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                <span className="text-sm">{item.label}</span>
                {active && (
                  <div className="absolute right-0 top-2 bottom-2 w-[3px] bg-primary rounded-l-full" />
                )}
                {item.label === 'Notifications' && !active && (
                  <span className="ml-auto size-1.5 rounded-full bg-destructive" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto p-3 space-y-4">
        <Separator className="opacity-50" />
        
        <div className="space-y-1">
          <Link href="/settings">
            <Button
              variant={pathname === '/settings' ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'w-full justify-start gap-3 h-10 px-3 font-medium transition-all',
                pathname === '/settings'
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Settings className="size-[18px] shrink-0" />
              <span className="text-sm">Settings</span>
            </Button>
          </Link>
          <Link href="/help">
            <Button
              variant={pathname === '/help' ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'w-full justify-start gap-3 h-10 px-3 font-medium transition-all',
                pathname === '/help'
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CircleHelp className="size-[18px] shrink-0" />
              <span className="text-sm">Help Center</span>
            </Button>
          </Link>
          
          <div className="mt-4 p-2 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-3">
             <Avatar className="size-9 rounded-xl border border-border shadow-sm">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                {user?.name?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate leading-tight">{user?.name || 'Student'}</p>
              <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-tighter">{user?.role || 'Student'}</p>
            </div>
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
              title="Logout"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
