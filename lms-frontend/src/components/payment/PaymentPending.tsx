'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PaymentPendingProps {
  courseId: string;
  paymentId: string;
}

export default function PaymentPending({ courseId, paymentId }: PaymentPendingProps) {
  const router = useRouter();
  const [dots, setDots] = useState('');

  const { data: access } = useQuery({
    queryKey: ['check-access', courseId],
    queryFn: () => api.getCourseAccess(courseId).then((r) => r.data),
    refetchInterval: (query) => {
      // If we have access, stop polling
      if (query.state.data?.hasAccess) return false;
      return 3000; // Poll every 3 seconds
    },
  });

  useEffect(() => {
    if (access?.hasAccess) {
      router.push(`/course/${courseId}`);
    }
  }, [access, courseId, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-110 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="relative mb-8">
        <div className="size-24 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
          <Loader2 size={40} className="text-primary animate-spin" strokeWidth={2} />
        </div>
      </div>

      <div className="max-w-sm">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Confirming Enrollment{dots}</h3>
        <p className="text-slate-500 mt-3 font-medium text-sm leading-relaxed">
          We've received your payment. We are currently finalizing your access to the course content. This usually takes a few seconds.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span className="material-symbols-outlined text-[14px]">verified_user</span>
          Transaction ID: {paymentId}
        </div>
        <p className="text-xs text-slate-400 font-medium">Please do not refresh the page</p>
      </div>

      {/* Success Hint (Hidden but ready) */}
      {access?.hasAccess && (
        <div className="mt-8 animate-in slide-in-from-bottom-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-semibold">
          Redirecting to Course...
        </div>
      )}
    </div>
  );
}
