'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Terminal, Eye, EyeOff, Loader2, Mail, Lock, CheckCircle2, ChevronLeft, Home, Code2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(form);
      setUser(res.data.user);
      if (res.data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-900 font-sans antialiased bg-white">
      {/* Left Side - Branding/Creative */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-700 via-blue-600 to-indigo-600 items-center justify-center p-12 relative overflow-hidden border-r border-blue-500/20 font-sans">
        {/* Minimalist Background Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`, backgroundSize: '32px 32px' }} 
        />
        
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="absolute top-8 left-12 flex items-center gap-2 text-blue-100 hover:text-white transition-all font-bold text-sm group"
        >
          <div className="size-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all text-white">
            <ChevronLeft size={16} />
          </div>
          Back to Home
        </Link>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-sm text-center">
          {/* Creative Element: Minimalist macOS-style Code Snippet */}
          <div className="mb-12 relative group">
            <div className="bg-white rounded-2xl border border-white/10 shadow-2xl shadow-blue-900/40 overflow-hidden transform group-hover:-translate-y-1 transition-transform duration-500">
              <div className="h-10 bg-slate-50/50 border-b border-slate-100 flex items-center px-4 gap-2">
                <div className="size-3 rounded-full bg-red-400 border border-red-500/10" />
                <div className="size-3 rounded-full bg-blue-400 border border-blue-500/10" />
                <div className="size-3 rounded-full bg-emerald-400 border border-emerald-500/10" />
              </div>
              <div className="p-8 text-left font-mono text-sm space-y-3">
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4 text-xs">01</span>
                  <span className="text-slate-400 italic">// Define your future</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4 text-xs">02</span>
                  <span className="text-slate-800">const path = <span className="text-primary font-semibold">&apos;Mastery&apos;</span>;</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4 text-xs">03</span>
                  <span className="text-slate-800">Learn.grow(path);</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4 text-xs">04</span>
                  <span className="text-primary animate-pulse">_</span>
                </div>
              </div>
            </div>
            {/* Soft Glow */}
            <div className="absolute -inset-10 bg-white/20 rounded-full blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Level up your <br />
            <span className="text-blue-100 font-black">Engineering Career.</span>
          </h1>
          <p className="text-blue-100/80 text-base font-medium leading-relaxed px-4">
            Structured courses designed by industry experts to help you master Data Structures, Algorithms, and System Design.
          </p>
        </div>

        {/* Bottom Badge */}
        <div className="absolute bottom-12 flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-sm">
          <div className="size-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-blue-50 uppercase tracking-[0.2em]">10k+ Engineers Learning Now</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-12 group hover:opacity-90 transition-opacity">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              CodeDevin<span className="text-primary">.</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">Please enter your details to sign in.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm font-medium mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <Input
                placeholder="e.g. alex@codedevin.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                leftIcon={<Mail size={18} className="text-slate-400" />}
                className="h-11 rounded-lg border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  leftIcon={<Lock size={18} className="text-slate-400" />}
                  className="h-11 rounded-lg border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors h-11 w-11 flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-6 shadow-sm transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Social / Switch */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Legal */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            <Link href="/help" className="hover:text-slate-600 transition-colors">Help</Link>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
