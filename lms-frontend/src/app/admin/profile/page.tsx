'use client';
import { useAuthStore } from '@/stores/auth.store';
import { User, Mail, Shield, ShieldCheck, ArrowLeft, Calendar, Camera, Key, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminProfilePage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading || !user) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200/60 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-200/60 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-200/60 rounded animate-pulse" />
        </div>
        
        <div className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm animate-pulse">
            <div className="h-48 bg-slate-100" />
            <div className="p-8 pt-12 space-y-8 relative">
                <div className="absolute -top-12 left-8 size-24 rounded-full bg-slate-200 border-4 border-white" />
                <div className="space-y-3">
                    <div className="h-8 w-64 bg-slate-200/60 rounded" />
                    <div className="h-4 w-40 bg-slate-200/60 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-24 bg-slate-100 rounded-lg" />
                    <div className="h-24 bg-slate-100 rounded-lg" />
                    <div className="h-24 bg-slate-100 rounded-lg" />
                </div>
            </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Administrator Profile
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your personal information, security settings, and system credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="hidden sm:flex h-9 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md items-center justify-center text-sm font-medium gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <Link 
            href="/admin/settings"
            className="hidden sm:flex h-9 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md items-center justify-center text-sm font-medium gap-2"
          >
            <Key className="size-4" />
            Credentials
          </Link>
          <button className="h-9 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2">
             <LogOut className="size-4" />
             Sign Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 sm:h-48 bg-linear-to-r from-slate-100 to-slate-50 border-b border-slate-200 relative">
          <div className="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-8">
            <div className="size-20 sm:size-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-sm relative group overflow-hidden">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <Camera className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="pt-14 sm:pt-16 px-6 sm:px-8 pb-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                {user?.name || 'Administrator'}
                <span title="Verified Staff"><ShieldCheck className="size-5 text-emerald-500" /></span>
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 font-medium">
                <p className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary rounded border border-primary/10">
                  <ShieldCheck className="size-3.5" />
                  Primary Controller
                </p>
                <div className="size-1 rounded-full bg-slate-300" />
                <p className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Joined {new Date().getFullYear()}
                </p>
              </div>
            </div>
            
            <Link 
              href="/admin/settings"
              className="px-4 h-9 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
            >
              Edit Details
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3 flex items-start gap-4">
              <div className="size-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Mail className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Contact Email</p>
                <p className="text-sm font-medium text-slate-900 truncate">{user?.email || 'admin@codedevin.com'}</p>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3 flex items-start gap-4">
              <div className="size-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Shield className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Access Role</p>
                <p className="text-sm font-medium text-slate-900">System Governance (Tier 1)</p>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3 flex items-start gap-4">
              <div className="size-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <User className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Account Status</p>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-medium text-slate-900">Active & Accessible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
