'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

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
    <div className="fixed inset-0 bg-white z-110 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="relative mb-12">
        <div className="size-32 border-4 border-slate-100 rounded-full" />
        <div className="size-32 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">sync_saved_locally</span>
        </div>
      </div>

      <div className="max-w-sm">
        <h3 className="text-3xl font-black text-foreground tracking-tight">Confirming Enrollment{dots}</h3>
        <p className="text-foreground-secondary mt-4 font-medium leading-relaxed">
          We've received your payment. We are currently finalizing your access to the course content. This usually takes a few seconds.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          Transaction ID: {paymentId}
        </div>
        <p className="text-xs text-muted font-bold">Please do not refresh the page</p>
      </div>

      {/* Success Hint (Hidden but ready) */}
      {access?.hasAccess && (
        <div className="mt-8 transform animate-bounce bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
          Redirecting to Course...
        </div>
      )}
    </div>
  );
}
