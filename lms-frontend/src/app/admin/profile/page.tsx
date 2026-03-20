'use client';
import { useAuthStore } from '@/stores/auth.store';
import { User, Mail, Shield, ShieldCheck, ArrowLeft, Calendar, Camera } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProfilePage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto p-10 py-16 space-y-12">
        <Skeleton className="h-12 w-48 rounded-2xl mb-12" />
        
        <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="h-64 bg-slate-50 relative">
            <div className="absolute -bottom-20 left-16 p-2.5 bg-white rounded-[42px]">
              <Skeleton className="size-40 rounded-[32px] border-4 border-white" />
            </div>
          </div>
          
          <div className="pt-28 px-16 pb-20 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <Skeleton className="h-12 w-80 rounded-xl" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-40 rounded-lg" />
                  <Skeleton className="h-8 w-40 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-14 w-56 rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-[32px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto p-10 py-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <Link
        href="/admin/dashboard"
        className="group inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200/60 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all shadow-sm mb-12"
      >
        <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
        Governance Dashboard
      </Link>

      <div className="bg-white rounded-[48px] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="h-64 bg-linear-to-br from-primary/10 via-primary/5 to-transparent relative">
          <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="absolute -bottom-20 left-16 p-2.5 bg-white rounded-[42px] shadow-2xl shadow-primary/10">
            <div className="size-40 rounded-[32px] bg-primary flex items-center justify-center text-white text-5xl font-black relative group overflow-hidden border-4 border-white shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
              <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                <Camera className="size-10 text-white scale-75 group-hover:scale-100 transition-transform" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-28 px-16 pb-20 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{user?.name || 'Administrator'}</h1>
              <div className="flex items-center gap-4 mt-4">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 shadow-sm">
                  <ShieldCheck size={14} />
                  Institutional Controller
                </p>
                <div className="size-1.5 rounded-full bg-slate-200" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={13} />
                  Active Since 2024
                </p>
              </div>
            </div>
            
            <Link 
              href="/admin/settings"
              className="px-8 py-4 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-black hover:scale-105 active:scale-95 transition-all"
            >
              Modify System Config
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[32px] space-y-5 group hover:border-primary/20 transition-all">
              <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Electronic Mail ID</p>
                <p className="text-[15px] font-bold text-slate-900 truncate">{user?.email || 'admin@codedevin.com'}</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[32px] space-y-5 group hover:border-primary/20 transition-all">
              <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Security Authorization</p>
                <p className="text-[15px] font-bold text-slate-900">Level 0: Governance</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[32px] space-y-5 group hover:border-primary/20 transition-all">
              <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Profile Integrity</p>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[15px] font-bold text-slate-900">Archive Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
