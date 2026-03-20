'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import { 
  Award, 
  Download, 
  ExternalLink, 
  Search, 
  Trophy, 
  CheckCircle2,
  FileBadge,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Lock,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => api.getMyCertificates().then((r) => r.data),
  });

  const certList = certificates || [];

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-bg-subtle rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-bg-subtle rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-bg-subtle rounded-2xl animate-pulse" />
        </div>

        {/* Certificates Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface rounded-[32px] border border-border h-80 animate-pulse shadow-sm shadow-primary/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Professional Credentials</h1>
          <p className="text-text-secondary font-medium">Verified industry-ready certifications earned by you</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100/50">
          <Trophy size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Mastery Achieved</span>
        </div>
      </div>

      {certList.length === 0 ? (
        <div className="bg-bg-surface rounded-[40px] border border-border border-dashed p-20 text-center flex flex-col items-center gap-8 shadow-sm">
          <div className="relative">
            <div className="size-28 bg-amber-50 rounded-[32px] flex items-center justify-center text-amber-500 shadow-xl shadow-amber-200/20 rotate-3 group-hover:rotate-6 transition-transform">
              <Award size={56} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-amber-100">
               <ShieldCheck size={24} className="text-amber-600" />
            </div>
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-text-primary tracking-tight">No credentials earned yet</h3>
            <p className="text-text-secondary font-medium mt-3 leading-relaxed">
              Unlock your true potential. Complete your enrolled courses, master the modules, and ace the final assessments to earn your verified certificates.
            </p>
          </div>
          <Link href="/my-courses">
            <Button size="lg" className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 group">
              Start Learning Journey
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {certList.map((cert: any) => (
            <div key={cert.id} className="group bg-bg-surface rounded-[32px] border border-border p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
              {/* Card Decorations */}
              <div className="absolute -top-10 -right-10 size-40 bg-amber-50/50 rounded-full blur-3xl group-hover:bg-amber-100/50 transition-colors" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 group-hover:h-2 transition-all" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="size-16 rounded-[20px] bg-slate-900 flex items-center justify-center text-amber-400 shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">
                   <FileBadge size={32} strokeWidth={1.5} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Issue Date</p>
                  <p className="text-sm font-bold text-text-primary flex items-center gap-1.5 justify-end">
                    <Calendar size={14} className="text-text-muted" />
                    {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex-1 relative z-10 space-y-4">
                <div className="space-y-1">
                   <div className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-[10px] font-bold text-success uppercase tracking-widest">Verified Credentials</span>
                   </div>
                   <h3 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors leading-tight line-clamp-2">
                     {cert.course?.title}
                   </h3>
                </div>
                
                <div className="flex items-center justify-between py-3 border-y border-slate-50">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Certificate ID</span>
                      <span className="text-[11px] font-mono font-bold text-text-primary tracking-tighter">{cert.certificateCode}</span>
                   </div>
                   <div className="size-8 rounded-lg bg-bg-subtle flex items-center justify-center text-text-muted opacity-50">
                      <Cpu size={14} />
                   </div>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <Button 
                  onClick={() => {
                    if (cert.pdfUrl) {
                      window.open(`${API_URL}${cert.pdfUrl}`, '_blank');
                    } else {
                      toast.info('Generation in Progress', {
                        description: 'Your certificate is being generated. Please check back in a few seconds.',
                      });
                    }
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 group border-2 border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-800 shadow-lg shadow-slate-900/10"
                >
                  <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                  GET CERTIFICATE
                </Button>
                <div className="mt-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                      Share to LinkedIn
                      <ExternalLink size={12} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
