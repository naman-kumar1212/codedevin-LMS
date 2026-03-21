'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Terminal, User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ChevronLeft, Home, Code2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(form.password);
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'][strength - 1] || 'Weak';
  const strengthColor = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][strength - 1] || 'bg-slate-200';

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans antialiased text-slate-900">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 w-full max-w-md p-10 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="size-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Check your email</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed mx-auto font-medium">
            We've sent a verification link to <br/><strong className="text-slate-900 font-semibold">{form.email}</strong>
          </p>
          <Link href="/login" className="block">
            <Button className="w-full h-11 font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border-none">
              <ChevronLeft size={18} className="mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
          {/* Creative Element: Minimalist Code Snippet */}
          <div className="mb-12 relative group">
            <div className="bg-white rounded-2xl border border-white/10 shadow-2xl shadow-blue-900/40 overflow-hidden transform group-hover:-translate-y-1 transition-transform duration-500">
              <div className="h-10 bg-slate-50/50 border-b border-slate-100 flex items-center px-4 gap-2">
                <div className="size-3 rounded-full bg-red-400 border border-red-500/10" />
                <div className="size-3 rounded-full bg-blue-400 border border-blue-500/10" />
                <div className="size-3 rounded-full bg-emerald-400 border border-emerald-500/10" />
              </div>
              <div className="p-8 text-left font-mono text-sm space-y-3">
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4">01</span>
                  <span className="text-slate-400 italic">// Initialize your potential</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4">02</span>
                  <span className="text-slate-800">const skill = <span className="text-primary">&apos;Engineering&apos;</span>;</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4">03</span>
                  <span className="text-slate-800">Career.upgrade(skill);</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary/40 font-bold w-4">04</span>
                  <span className="text-primary animate-pulse">_</span>
                </div>
              </div>
            </div>
            {/* Soft Glow */}
            <div className="absolute -inset-10 bg-white/20 rounded-full blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Start your journey to <br />
            <span className="text-blue-100 font-black">Technical Mastery.</span>
          </h1>
          <p className="text-blue-100/80 text-base font-medium leading-relaxed px-4">
            Join a professional community of developers and build skills that last a lifetime.
          </p>
        </div>

        {/* Bottom Badge */}
        <div className="absolute bottom-12 flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-sm">
          <div className="size-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-blue-50 uppercase tracking-[0.2em]">Industry Standard Curriculum</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-500 py-8 lg:py-0">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-10 group hover:opacity-90 transition-opacity">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              CodeDevin<span className="text-primary">.</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">Join our professional learning community.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm font-medium mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <Input
                placeholder="e.g. Alex Rivera"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                leftIcon={<User size={18} className="text-slate-400" />}
                className="h-11 rounded-lg border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <Input
                placeholder="alex@codedevin.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                leftIcon={<Mail size={18} className="text-slate-400" />}
                className="h-11 rounded-lg border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Input
                  placeholder="Create a strong password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
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
              {form.password && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex gap-1 h-1.5 mb-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full grow rounded-full transition-all duration-300 ${
                          step <= strength ? strengthColor : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    Strength: <span className={strength > 0 ? 'text-slate-900' : ''}>{strengthText}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <Input
                placeholder="Repeat password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                leftIcon={<Lock size={18} className="text-slate-400" />}
                className="h-11 rounded-lg border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="flex items-start gap-3 pt-4 mb-2">
              <input 
                className="mt-0.5 size-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer" 
                id="terms" 
                type="checkbox" 
                required 
              />
              <label className="text-sm font-medium text-slate-500" htmlFor="terms">
                I agree to the <Link className="text-slate-900 font-semibold hover:text-primary transition-colors" href="/terms">Terms</Link> and <Link className="text-slate-900 font-semibold hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>.
              </label>
            </div>

            <Button
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-2 shadow-sm transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
