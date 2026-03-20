'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import Script from 'next/script';
import { useAuthStore } from '@/stores/auth.store';
import { ShoppingCart, CreditCard, Lock, Loader2, X, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PaymentModalProps {
  courseId: string;
  courseTitle: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({
  courseId,
  courseTitle,
  amount,
  onSuccess,
  onClose,
}: PaymentModalProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const user = useAuthStore((s) => s.user);

  const createPaymentMutation = useMutation({
    mutationFn: () => api.createPayment(courseId),
  });

  const handlePayment = async () => {
    try {
      const response = await createPaymentMutation.mutateAsync();
      const order = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount * 100, // in paise
        currency: 'INR',
        name: 'CodeDevin Solutions',
        description: `Enrollment for ${courseTitle}`,
        order_id: order.razorpayOrderId,
        handler: function (response: any) {
          onSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#2563EB', // Our blue brand color
        },
        modal: {
          ondismiss: function () {
            onClose();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment Error', {
        description: 'Failed to initialize payment. Please check your connection and try again.',
      });
    }
  };

  useEffect(() => {
    if (sdkLoaded) {
      handlePayment();
    }
  }, [sdkLoaded]);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setSdkLoaded(true)}
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] font-sans antialiased text-slate-900">
          <div className="p-10 text-center bg-white relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -right-24 size-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 size-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-sm border border-primary/5">
                <ShoppingCart size={40} strokeWidth={2.5} />
              </div>
              
              <DialogHeader className="p-0 mb-3">
                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-center">
                  Confirm Enrollment
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-semibold text-center text-sm mt-3 leading-relaxed">
                  You're about to gain lifetime access to 
                  <span className="text-slate-900 font-black decoration-primary/30 underline underline-offset-4 ml-1">
                    {courseTitle}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-10 bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 shadow-inner group transition-colors hover:bg-slate-50 duration-500">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Course Valuation</span>
                  <Badge variant="outline" className="font-bold border-primary/20 bg-white text-primary px-3 py-1 rounded-lg">₹{amount}</Badge>
                </div>
                <Separator className="my-5 bg-slate-200/60" />
                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payable</span>
                    <span className="text-sm font-black text-slate-900">Final Invoice</span>
                  </div>
                  <span className="text-4xl font-black text-primary tracking-tighter tabular-nums drop-shadow-sm">₹{amount}</span>
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-5">
                <Button
                  size="lg"
                  onClick={() => sdkLoaded && handlePayment()}
                  disabled={createPaymentMutation.isPending}
                  className="w-full h-16 rounded-[1.25rem] font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/95 text-white border-none"
                >
                  {createPaymentMutation.isPending ? (
                    <>
                      <Loader2 size={24} className="animate-spin mr-3" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={22} className="mr-3" strokeWidth={2.5} />
                      Secure Checkout
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full h-12 rounded-xl text-slate-400 font-bold hover:text-slate-900 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                >
                  Cancel Transaction
                </Button>
              </div>

              <div className="mt-10 flex items-center justify-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                  <ShieldCheck size={16} className="text-primary" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    Bank-Grade 256-bit Encryption
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col items-center gap-1 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                  Powered by Razorpay Global Infrastructure
                </p>
                <div className="h-px w-8 bg-slate-200" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
