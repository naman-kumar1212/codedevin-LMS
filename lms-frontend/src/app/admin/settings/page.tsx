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
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-10 w-48 rounded-md" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Sidebar Skeleton */}
          <div className="xl:col-span-3 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="xl:col-span-9">
            <div className="bg-white p-8 rounded-xl border border-slate-100 min-h-[600px] space-y-8">
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-12 rounded-md" />
              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <Skeleton className="h-10 w-32 rounded-md" />
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Configure platform preferences, manage institutional security protocols, and update administrative identity records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="h-10 px-4 bg-white hover:bg-slate-50 text-slate-600 transition-colors rounded-md flex items-center gap-2 text-sm font-medium border border-slate-200 shadow-sm">
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <button className="bg-primary text-white h-10 px-4 rounded-md text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Save className="size-4" />
            Commit Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-md transition-colors group ${activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`size-4 ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 transition-colors'
                    }`} />
                  <span className="text-sm">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-primary mb-2">
              <ShieldCheck className="size-4" />
              <p className="text-sm font-semibold">Governance</p>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Modifying system configuration affects platform-wide accessibility. These changes are logged for auditing.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-9">
          <div className="bg-white p-6 lg:p-8 rounded-xl border border-slate-200/60 shadow-sm min-h-[600px] relative overflow-hidden">
            {activeTab === 'General' && (
              <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Protocols</h2>
                  <p className="text-slate-500 mt-2 text-sm max-w-2xl">Fine-tune global learning preferences and institutional standards.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 pr-4">
                          <h3 className="text-base font-semibold text-slate-900">Open Enrollment</h3>
                          <p className="text-sm text-slate-500">Allow anyone to register and view the platform catalog.</p>
                        </div>
                        <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-primary">
                          <span className="inline-block size-4 translate-x-4 transform rounded-full bg-white transition duration-200 ease-in-out" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 pr-4">
                          <h3 className="text-base font-semibold text-slate-900">Auto-Credentialing</h3>
                          <p className="text-sm text-slate-500">Issue certificates automatically upon completion.</p>
                        </div>
                        <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-primary">
                          <span className="inline-block size-4 translate-x-4 transform rounded-full bg-white transition duration-200 ease-in-out" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Global Announcement Broadcast</label>
                    <div className="relative group bg-white border border-slate-200 rounded-md shadow-sm">
                      <Bell className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="Broadcast a message to all active students..."
                        className="w-full bg-transparent border-none rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-end">
                  <button className="bg-primary text-white h-10 px-6 rounded-md text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Save className="size-4" />
                    Save Protocols
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Administrative Identity</h2>
                  <p className="text-slate-500 mt-2 text-sm max-w-2xl">Update your professional profile and contact information.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-white border border-slate-200 shadow-sm rounded-xl">
                  <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold relative group overflow-hidden border border-primary/20">
                    {user?.name?.charAt(0) || 'A'}
                    <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="size-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name || 'Administrator'}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500">
                      <Mail className="size-4 text-slate-400" />
                      <p className="text-sm font-medium">{user?.email || 'admin@lms-platform.com'}</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">Master Admin</span>
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md border border-green-200 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        Identity Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Legal Designation / Full Name</label>
                    <div className="relative group bg-white border border-slate-200 rounded-md shadow-sm">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        className="w-full bg-transparent border-none rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Contact Electronic Mail</label>
                    <div className="relative group bg-white border border-slate-200 rounded-md shadow-sm">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full bg-transparent border-none rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4">
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Discard Alterations</button>
                  <button className="w-full sm:w-auto bg-primary text-white h-10 px-6 rounded-md text-sm font-medium shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <Save className="size-4" />
                    Synchronize Identity
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-in fade-in duration-500 py-16">
                <div className="size-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-8 shadow-sm group">
                  <Database className="size-10 group-hover:text-primary transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Infrastructure Vault</h2>
                <p className="text-slate-500 mt-4 text-sm max-w-sm leading-relaxed">
                  Infrastructure configurations and API access keys are managed by authorized system architects within the air-gapped environment.
                </p>
                <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-md border border-blue-100">
                  <ShieldCheck className="size-4 text-primary" />
                  <p className="text-xs font-semibold text-primary">Restricted Administrative Access Only</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistence Ledger */}
      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Governance Active</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Database className="size-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Node Sync Verified</p>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
          System Descriptor: <span className="text-slate-700 font-semibold">LMS_CORE_V2.0.4</span>
        </p>
      </div>
    </div>
  );
}
