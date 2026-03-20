'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings,
  Database,
  UserCircle2,
  ShieldCheck,
  Save,
  Bell,
  Globe,
  Mail,
  Cloud,
  LayoutDashboard,
  Lock,
  ChevronRight,
  User,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'General' | 'Security' | 'Profile'>('General');

  const settingsTabs = [
    { id: 'General', label: 'Platform Settings', icon: Globe },
    { id: 'Security', label: 'Infrastructure', icon: Database },
    { id: 'Profile', label: 'Account Identity', icon: UserCircle2 },
  ];

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 rounded-2xl" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-48 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Sidebar Skeleton */}
          <div className="xl:col-span-3 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="xl:col-span-9">
            <div className="bg-white p-12 rounded-[40px] border border-slate-100 min-h-[600px] space-y-12">
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <Skeleton className="h-32 rounded-3xl" />
                <Skeleton className="h-32 rounded-3xl" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-16 rounded-2xl" />
              </div>

              <div className="pt-12 border-t border-slate-100 flex justify-end">
                <Skeleton className="h-14 w-48 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Settings
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-medium max-w-xl">
            Configure platform preferences, manage institutional security protocols, and update administrative identity records.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm shadow-primary/5">
          <Link href="/admin/dashboard" className="h-12 px-6 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-slate-100">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <div className="w-px h-8 bg-slate-100 hidden sm:block mx-1" />
          <button className="bg-primary text-white h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 group">
            <Save className="size-4 group-hover:scale-110 transition-transform" />
            Commit Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm shadow-primary/5 flex flex-col gap-1.5">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-between px-5 py-4 rounded-xl transition-all group ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-primary'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <tab.icon className={`size-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-300 group-hover:text-primary/70 transition-colors'
                    }`} />
                  <span className="text-[11px] font-black uppercase tracking-[0.05em]">{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="size-3 text-white/60" />}
              </button>
            ))}
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
            <div className="flex items-center gap-2 text-primary mb-3">
              <ShieldCheck className="size-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Governance</p>
            </div>
            <p className="text-primary/70 text-[10px] font-bold leading-relaxed uppercase tracking-tight">
              Modifying system configuration affects platform-wide accessibility. These changes are logged for auditing.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-9">
          <div className="bg-white p-8 lg:p-12 rounded-[40px] border border-slate-100 shadow-sm shadow-primary/5 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 opacity-40" />

            {activeTab === 'General' && (
              <div className="space-y-12 animate-in fade-in duration-500 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Academic <span className="text-primary italic font-serif">Protocols</span></h2>
                  <p className="text-slate-400 mt-1.5 font-bold text-[11px] uppercase tracking-widest">Fine-tune global learning preferences and institutional standards.</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-primary/20 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">Open Enrollment</h3>
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wide">Allow anyone to register and view the platform catalog.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-primary shadow-inner">
                          <span className="inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-primary/20 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">Auto-Credentialing</h3>
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wide">Issue certificates automatically upon completion.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-primary shadow-inner">
                          <span className="inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Announcement Broadcast</label>
                    <div className="relative group bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <Bell className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="Broadcast a message to all active students..."
                        className="w-full bg-white border-none rounded-xl py-4 pl-14 pr-6 text-[13px] font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-slate-100 flex justify-end">
                  <button className="bg-primary text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all flex items-center gap-3">
                    <Save className="size-4" />
                    Save Protocols
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="space-y-12 animate-in fade-in duration-500 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Administrative <span className="text-primary italic font-serif">Identity</span></h2>
                  <p className="text-slate-400 mt-1.5 font-bold text-[11px] uppercase tracking-widest">Update your professional profile and contact information.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-10 p-10 bg-slate-50/50 border border-slate-100 rounded-[32px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 size-32 bg-primary/5 group-hover:bg-primary/10 transition-all rounded-bl-[100px]" />
                  <div className="size-32 rounded-3xl bg-primary flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-primary/30 relative group overflow-hidden border-4 border-white">
                    {user?.name?.charAt(0) || 'A'}
                    <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                      <Upload className="size-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{user?.name || 'Administrator'}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-400">
                      <Mail className="size-4 text-primary/40" />
                      <p className="text-[13px] font-bold lowercase">{user?.email || 'admin@lms-platform.com'}</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-6">
                      <span className="px-5 py-2 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-slate-900/10">Master Admin</span>
                      <span className="px-5 py-2 bg-white border border-slate-100 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="size-3" />
                        Identity Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Designation / Full Name</label>
                    <div className="relative group bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        className="w-full bg-white border-none rounded-xl py-4 pl-14 pr-6 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Electronic Mail</label>
                    <div className="relative group bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full bg-white border-none rounded-xl py-4 pl-14 pr-6 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-6">
                  <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest p-4 transition-colors">Discard Alterations</button>
                  <button className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center gap-3">
                    <Save className="size-4" />
                    Synchronize Identity
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center animate-in fade-in duration-500 py-20">
                <div className="size-32 rounded-[40px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 mb-10 shadow-inner group">
                  <Database className="size-16 group-hover:text-primary transition-colors" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Infrastructure <span className="text-primary italic font-serif">Vault</span></h2>
                <p className="text-slate-400 mt-4 text-[13px] font-bold uppercase tracking-tight max-w-sm leading-relaxed">
                  Infrastructure configurations and API access keys are managed by authorized system architects within the air-gapped environment.
                </p>
                <div className="mt-12 flex items-center gap-3 px-8 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                  <ShieldCheck className="size-4 text-primary" />
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">Restricted Administrative Access Only</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistence Ledger */}
      <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Governance Active</p>
          </div>
          <div className="flex items-center gap-3">
            <Database className="size-5 text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Node Sync Verified</p>
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">System Descriptor: <span className="text-primary font-black">LMS_CORE_V2.0.4</span></p>
      </div>
    </div>
  );
}
