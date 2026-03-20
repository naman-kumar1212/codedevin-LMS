'use client';

import { ReactNode } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { AdminSidebar } from './AdminSidebar';
import { StudentTopbar } from './StudentTopbar';
import AdminTopbar from './AdminTopbar';
import { Footer } from './Footer';
import { useAuthStore } from '@/stores/auth.store';

interface StudentLayoutProps {
  children: ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-bg-page font-sans">
      {isAdmin ? <AdminSidebar /> : <StudentSidebar />}
      <div className="pl-[240px] flex flex-col min-h-screen">
        {isAdmin ? <AdminTopbar /> : <StudentTopbar />}
        <main className="flex-1 p-8">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
