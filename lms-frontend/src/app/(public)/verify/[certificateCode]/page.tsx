'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { 
  ShieldCheck, 
  Award, 
  User, 
  BookOpen, 
  Calendar, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Hash,
  Download,
  Share2,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function CertificateVerificationPage() {
  const params = useParams();
  const code = params.certificateCode as string;

  const { data: verifyData, isLoading, isError } = useQuery({
    queryKey: ['verify-certificate', code],
    queryFn: () => api.verifyCertificate(code),
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-24 bg-white rounded-4xl flex items-center justify-center mb-8 shadow-sm border border-slate-100">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Validating Cryptographic Credential</h2>
        <p className="text-slate-500 font-medium">Please wait while we interact with the institutional blockchain registry...</p>
      </div>
    );
  }

  if (isError || !verifyData?.data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-lg shadow-red-500/10 animate-bounce">
          <XCircle className="size-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase">Verification Failure</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          The certificate code <span className="text-slate-900 font-bold">{code}</span> could not be authenticated in our global registry. It may be invalid or has been revoked by the institution.
        </p>
        <div className="mt-12 flex items-center gap-6">
            <Link href="/" className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">Return Home</Link>
            <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-900 hover:border-slate-800 transition-all">Retry Probe</button>
        </div>
      </div>
    );
  }

  const certificate = verifyData.data;

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Verification Guard Header */}
      <div className="text-center mb-16 space-y-4">
        <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-slate-200" />
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-2">
                <ShieldCheck className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authentic Credential Verified</span>
            </div>
            <div className="h-px w-12 bg-slate-200" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Official Certification</h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">This document serves as definitive proof of academic achievement validated by institutional governance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Certificate Rendering (Simulation) */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[1.414/1] bg-white rounded-4xl border-12 border-slate-900 overflow-hidden shadow-2xl p-1/12 flex flex-col items-center justify-center text-center">
             {/* Security Watermark */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-15deg] pointer-events-none select-none">
                < Award className="size-[400px]" />
             </div>
             
             <Award className="size-16 text-primary mb-6" />
             <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 mb-8 underline decoration-primary decoration-4 underline-offset-8">Certificate of Completion</h2>
             <p className="text-sm font-medium text-slate-400 italic mb-2 tracking-wide">This is to certify that</p>
             <h3 className="text-3xl font-serif font-black text-slate-900 mb-6 tracking-tight">{certificate.student.name}</h3>
             <p className="text-sm font-medium text-slate-400 italic mb-2 tracking-wide">has successfully mastered the requirements of</p>
             <h4 className="text-xl font-bold text-slate-900 mb-10 max-w-[80%] leading-snug">{certificate.course.title}</h4>
             
             <div className="grid grid-cols-2 gap-12 text-left w-full px-12 mt-4">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-2">Issuance Epoch</p>
                   <p className="text-sm font-bold text-slate-900">{new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-2">Registry Hash</p>
                   <p className="text-[11px] font-black text-slate-900 tracking-widest">{code.toUpperCase()}</p>
                </div>
             </div>

             <div className="absolute bottom-8 flex items-center gap-3">
                <div className="size-2 rounded-full bg-primary" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Certified by LMS Institutional</p>
             </div>
          </div>
          
          <div className="mt-10 flex flex-wrap gap-4 items-center justify-center">
            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                <Download className="size-4" />
                Download Vector PDF
            </button>
            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm">
                <Share2 className="size-4" />
                Share on LinkedIn
            </button>
          </div>
        </div>

        {/* Detailed Verification Registry */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <Activity className="size-4 text-primary" />
                    Registry Metadata
                </h3>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <User className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient</p>
                            <p className="text-sm font-bold text-slate-900 tracking-tight">{certificate.student.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <BookOpen className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum Mastery</p>
                            <p className="text-sm font-bold text-slate-900 tracking-tight">{certificate.course.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Hash className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credential ID</p>
                            <p className="text-xs font-black text-primary tracking-widest">{code}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Calendar className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authentication Date</p>
                            <p className="text-sm font-bold text-slate-900 tracking-tight">Verified Live</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
                        <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                        <p className="text-[11px] font-medium text-emerald-800 leading-relaxed">
                            This credential has been verified as authentic and is currently active in our records. All academic milestones for this course have been achieved by the student.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-10 bg-slate-900 rounded-3xl text-center space-y-6">
                <h4 className="text-lg font-bold text-white">Inspired to Learn?</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">Join 10,000+ professionals mastering the latest industry technologies with our institutional certifications.</p>
                <Link href="/courses" className="block w-full py-4 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all">Explore Curriculum</Link>
            </div>
        </div>
      </div>
      
      <div className="mt-20 pt-10 border-t border-slate-100 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Institutional Transparency Protocol v4.0</p>
      </div>
    </div>
  );
}
