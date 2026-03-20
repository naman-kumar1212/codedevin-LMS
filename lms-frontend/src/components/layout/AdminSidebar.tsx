'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Book,
  Users,
  Video,
  CreditCard,
  Award,
  BarChart2,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: Book },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/live-classes', label: 'Live Classes', icon: Video },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await api.logout(); } catch (e) {}
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-[240px] border-r border-border bg-card fixed left-0 top-0 h-full z-40 flex flex-col font-sans">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm group-hover:bg-primary/90 transition-all">
            <GraduationCap className="size-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">Codedevin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-3 custom-scrollbar">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'w-full justify-start gap-3 h-10 px-3 font-medium transition-all',
                  active 
                    ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 p-3 space-y-4">
        <Separator className="opacity-50" />
        
        <div className="space-y-1">
          <Link href="/admin/settings">
            <Button
              variant={pathname.startsWith('/admin/settings') ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'w-full justify-start gap-3 h-10 px-3 font-medium transition-all',
                pathname.startsWith('/admin/settings')
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Settings className="size-4 shrink-0" />
              Settings
            </Button>
          </Link>

          {/* User Card */}
          <div className="mt-4 p-2 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-3">
            <Avatar className="size-9 rounded-xl border border-border shadow-sm">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-tighter">System Administrator</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
