'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Shield as ShieldIcon,
  Calendar,
  Settings as SettingsIcon,
  BadgeCheck,
  Fingerprint,
  BellRing,
  Smartphone,
  Lock as LockIcon,
  Cpu
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.me()
      .then((res) => {
        setProfile(res.data);
        setName(res.data.name);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await api.me(); // auth check
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-10 animate-in fade-in duration-700 pb-20">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-bg-subtle rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-bg-subtle rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-bg-subtle rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-3 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 w-full bg-bg-subtle rounded-2xl animate-pulse" />
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-9 space-y-8">
            <div className="bg-bg-surface border border-border rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="h-6 w-48 bg-bg-subtle rounded mb-10 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 bg-bg-subtle rounded ml-1 animate-pulse" />
                    <div className="h-14 w-full bg-bg-subtle/50 rounded-2xl animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-slate-50">
                <div className="h-14 w-40 bg-bg-subtle rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-700 font-sans pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Account Settings</h1>
          <p className="text-text-secondary font-medium">Personalize your learning experience and preferences</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl">
          <Fingerprint size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Identity Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Sidebar Navigation (Visual Only for now) */}
         <div className="lg:col-span-3 space-y-2">
            <div className="p-4 bg-primary/5 text-primary rounded-2xl flex items-center gap-3 border border-primary/10 transition-all">
               <User size={18} />
               <span className="text-sm font-bold">Profile Details</span>
            </div>
            {['Security', 'Notifications', 'App Preferences', 'Connected Apps'].map((item) => (
               <div key={item} className="p-4 text-text-muted hover:bg-bg-subtle rounded-2xl flex items-center gap-3 transition-all cursor-not-allowed group">
                  <div className="size-4 shrink-0 transition-transform group-hover:scale-110">
                     {item === 'Security' && <ShieldIcon size={18} />}
                     {item === 'Notifications' && <BellRing size={18} />}
                     {item === 'App Preferences' && <Smartphone size={18} />}
                     {item === 'Connected Apps' && <Cpu size={18} />}
                  </div>
                  <span className="text-sm font-semibold">{item}</span>
                  <div className="ml-auto">
                     <LockIcon size={12} className="opacity-30" />
                  </div>
               </div>
            ))}
         </div>

         {/* Main Content */}
         <div className="lg:col-span-9 space-y-8">
            <div className="bg-bg-surface border border-border rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden">
               {/* Decoration */}
               <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
               
               <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50 relative z-10">
                  <div className="size-10 bg-bg-subtle rounded-xl flex items-center justify-center text-primary shadow-inner">
                     <SettingsIcon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary tracking-tight">General Information</h3>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Full Identity</label>
                        <Input
                           placeholder="Enter your full name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           className="h-14 rounded-2xl bg-bg-subtle/50 border-slate-100 hover:border-primary/20 focus:border-primary/50 transition-all"
                        />
                     </div>
                     <div className="space-y-2 opacity-80">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Primary Email</label>
                        <div className="relative group">
                           <Input
                              value={profile?.email || ''}
                              disabled
                              className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 italic pr-12 overflow-hidden text-ellipsis"
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {profile?.isVerified ? (
                                 <BadgeCheck size={20} className="text-success" />
                              ) : (
                                 <AlertCircle size={20} className="text-warning" />
                              )}
                           </div>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted pl-1 uppercase tracking-wider">
                           {profile?.isVerified ? '✓ Identity Verified' : '! Action Required'}
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                     <div className="p-6 bg-bg-subtle/30 rounded-2xl border border-border/50 flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Global Role</p>
                           <p className="text-sm font-black text-primary uppercase tracking-tighter">{profile?.role}</p>
                        </div>
                        <div className="size-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100">
                           <ShieldIcon size={20} />
                        </div>
                     </div>
                     <div className="p-6 bg-bg-subtle/30 rounded-2xl border border-border/50 flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Member Journey Since</p>
                           <p className="text-sm font-black text-text-primary uppercase tracking-tighter">
                              {profile?.createdAt
                                 ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                       year: 'numeric',
                                       month: 'short',
                                       day: 'numeric',
                                    })
                                 : '—'}
                           </p>
                        </div>
                        <div className="size-10 bg-white rounded-xl flex items-center justify-center text-text-muted shadow-sm border border-slate-100">
                           <Calendar size={20} />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-10 pt-8 border-t border-slate-50 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                     <Button
                        size="lg"
                        className="w-full sm:w-auto h-14 px-12 rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group"
                        onClick={handleSave}
                        disabled={saving || name === profile?.name}
                     >
                        {saving ? (
                           <Loader2 size={20} className="animate-spin" />
                        ) : (
                           <div className="flex items-center gap-2">
                              Commit Changes
                              <Save size={18} className="transition-transform group-hover:scale-110" />
                           </div>
                        )}
                     </Button>
                     
                     {error && (
                        <div className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-widest animate-in slide-in-from-left-2 transition-all">
                           <AlertCircle size={16} />
                           {error}
                        </div>
                     )}

                     {success && (
                        <div className="flex items-center gap-2 text-success text-xs font-bold uppercase tracking-widest animate-in slide-in-from-left-2 transition-all">
                           <CheckCircle size={16} />
                           Vault Updated Successfully
                        </div>
                     )}
                  </div>
               </div>
            </div>
            
            {/* Danger Zone */}
            <div className="bg-error-light/10 border border-error/10 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                   <h3 className="text-lg font-bold text-error tracking-tight">Deactivation Zone</h3>
                   <p className="text-xs font-medium text-text-secondary">Temporarily disable your account. This action can be undone later.</p>
                </div>
                <Button variant="outline" className="border-error/20 text-error hover:bg-error hover:text-white rounded-2xl px-8 h-12 font-bold uppercase tracking-widest text-[10px]">
                   Request Deactivation
                </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
