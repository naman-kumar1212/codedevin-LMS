'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Terminal, Eye, EyeOff, Loader2, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
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
    <div className="bg-bg-page min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-bg-surface rounded-3xl border border-border shadow-2xl p-8 md:p-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Terminal size={22} />
              </div>
              <h2 className="text-text-primary text-2xl font-bold tracking-tight">
                Codedevin<span className="text-primary">.</span>
              </h2>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome back</h1>
            <p className="text-text-secondary text-sm">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="bg-error-light border border-error/10 text-error rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              placeholder="e.g. alex@codedevin.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              leftIcon={<Mail size={18} className="text-text-muted" />}
              className="h-12"
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
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
                  leftIcon={<Lock size={18} className="text-text-muted" />}
                  className="h-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors h-10 w-10 flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              className="w-full h-12 text-sm font-bold uppercase tracking-widest mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Social / Switch */}
          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
          <Link href="/help" className="hover:text-text-primary transition-colors">Help</Link>
          <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  );
}
