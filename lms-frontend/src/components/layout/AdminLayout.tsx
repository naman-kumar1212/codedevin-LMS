'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { Footer } from './Footer';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-page font-sans">
      <AdminSidebar />
      <div className="pl-[240px] flex flex-col min-h-screen">
        <AdminTopbar />
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
