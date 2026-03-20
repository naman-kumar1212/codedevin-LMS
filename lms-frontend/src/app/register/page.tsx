'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Terminal, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
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
  const strengthColor = ['bg-error', 'bg-warning', 'bg-blue-400', 'bg-success'][strength - 1] || 'bg-border';

  if (success) {
    return (
      <div className="bg-bg-page min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="bg-bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-[440px] p-10 text-center z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="size-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8 text-success">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Check your email</h2>
          <p className="text-text-secondary text-sm mb-10 leading-relaxed mx-auto max-w-[280px]">
            We've sent a verification link to <strong className="text-text-primary">{form.email}</strong>.
          </p>
          <Link href="/login">
            <Button className="w-full h-12 text-sm font-bold uppercase tracking-widest" variant="outline">
              <ChevronLeft size={18} className="mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-page min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[480px] z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-bg-surface rounded-3xl border border-border shadow-2xl p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Terminal size={22} />
              </div>
              <h2 className="text-text-primary text-2xl font-bold tracking-tight">
                Codedevin<span className="text-primary">.</span>
              </h2>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Create an account</h1>
            <p className="text-text-secondary text-sm">Join our professional learning community</p>
          </div>

          {error && (
            <div className="bg-error-light border border-error/10 text-error rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="e.g. Alex Rivera"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              leftIcon={<User size={18} className="text-text-muted" />}
              className="h-12"
            />

            <Input
              label="Email Address"
              placeholder="alex@codedevin.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              leftIcon={<Mail size={18} className="text-text-muted" />}
              className="h-12"
            />

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Input
                  placeholder="Create password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
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
              {form.password && (
                <div className="pt-2 px-1 animate-in fade-in slide-in-from-top-1">
                  <div className="flex gap-1 h-1 mb-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full grow rounded-full transition-all duration-500 ${
                          step <= strength ? strengthColor : 'bg-bg-subtle'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Strength: <span className={strength > 0 ? 'text-text-primary' : ''}>{strengthText}</span>
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              placeholder="Repeat password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              leftIcon={<Lock size={18} className="text-text-muted" />}
              className="h-12"
            />

            <div className="flex items-start gap-3 pt-2">
              <input className="mt-0.5 size-4 rounded-md border-border text-primary focus:ring-primary/20 cursor-pointer" id="terms" type="checkbox" required />
              <label className="text-[11px] text-text-secondary leading-normal" htmlFor="terms">
                I agree to the <Link className="text-primary font-bold hover:underline" href="/terms">Terms</Link> and <Link className="text-primary font-bold hover:underline" href="/privacy">Privacy Policy</Link>.
              </label>
            </div>

            <Button
              className="w-full h-12 text-sm font-bold uppercase tracking-widest mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
