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
        <DialogContent className="max-w-md p-0 overflow-hidden border bg-white shadow-xl rounded-2xl font-sans antialiased text-slate-900">
          <div className="p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="size-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={32} strokeWidth={2} />
              </div>
              
              <DialogHeader className="p-0 mb-2">
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                  Confirm Enrollment
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
                  You're about to gain lifetime access to 
                  <span className="text-slate-900 font-semibold ml-1">
                    {courseTitle}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200 text-left">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Value</span>
                  <Badge variant="outline" className="font-semibold border-primary/20 bg-white text-primary px-2.5 py-0.5 rounded-md">₹{amount}</Badge>
                </div>
                <Separator className="my-4 bg-slate-200" />
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Payable</span>
                    <span className="text-sm font-semibold text-slate-900">Final Invoice</span>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">₹{amount}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={() => sdkLoaded && handlePayment()}
                  disabled={createPaymentMutation.isPending}
                  className="w-full h-12 rounded-xl font-semibold text-base shadow-sm bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  {createPaymentMutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} className="mr-2" strokeWidth={2} />
                      Secure Checkout
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full h-10 rounded-lg text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="text-xs font-medium text-slate-600">
                    Bank-Grade 256-bit Encryption
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col items-center gap-1 text-slate-400">
                <p className="text-[10px] font-medium uppercase tracking-wider">
                  Powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
