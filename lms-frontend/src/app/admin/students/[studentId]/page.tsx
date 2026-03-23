'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  ArrowLeft,
  Mail,
  Calendar,
  ShieldCheck,
  BookOpen,
  Award,
  CreditCard,
  ExternalLink,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DataTable } from '@/components/ui/DataTable';

export default function AdminStudentDetailsPage() {
  const { studentId } = useParams();

  const { data: student, isLoading } = useQuery({
    queryKey: ['admin-student', studentId],
    queryFn: () => api.getStudentDetails(studentId as string).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6 animate-in fade-in duration-700 font-sans">
        {/* Navigation Skeleton */}
        <div className="h-12 w-40 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/60" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar Skeleton */}
          <div className="space-y-10">
            <div className="bg-white rounded-xl border border-slate-200/60 p-8 space-y-8 animate-pulse">
              <div className="size-28 rounded-2xl bg-slate-100 mx-auto" />
              <div className="space-y-3">
                <div className="h-8 w-48 bg-slate-100 rounded-lg mx-auto" />
                <div className="h-4 w-32 bg-slate-100 rounded-md mx-auto" />
              </div>
              <div className="h-24 w-full bg-slate-50 rounded-3xl" />
            </div>
            <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="h-8 w-64 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-64 bg-white rounded-xl border border-slate-200/60 animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 bg-white rounded-xl border border-slate-200/60 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto text-center px-6">
        <div className="size-24 rounded-2xl bg-red-50 flex items-center justify-center text-red-200 mb-10 border border-red-100 shadow-sm shadow-red-900/5">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Student Not Found</h1>
        <p className="mt-4 text-slate-500 font-medium italic">The requested student profile could not be found.</p>
        <Link
          href="/admin/students"
          className="mt-12 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 pb-16 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-sans">
      {/* Navigation */}
      <Link
        href="/admin/students"
        className="group inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200/60 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all shadow-sm"
      >
        <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
        Back to Students
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Sidebar */}
        <div className="space-y-10">
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden p-8 text-center relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-primary/5 via-primary/10 to-transparent" />

            <div className="relative z-10">
              <div className="size-28 rounded-2xl bg-primary text-white text-4xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-primary/20 border-4 border-white mb-6 group overflow-hidden">
                <span className="group-hover:scale-110 transition-transform duration-500">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.name}</h1>
              <p className="text-[11px] font-mono text-slate-500 mt-1 uppercase">ID: {student.id}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                <ShieldCheck size={14} className="text-primary" />
                Account Status: <span className={student.isVerified ? 'text-primary' : 'text-slate-400'}>{student.isVerified ? 'VERIFIED' : 'PENDING'}</span>
              </div>

              <div className="mt-10 p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joined Date</p>
                    <p className="text-xs font-bold text-slate-900">
                      {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-colors duration-1000" />

            <div className="relative z-10 space-y-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Enrolled Courses</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black tracking-tight text-white">{student.enrollments?.length || 0}</p>
                  <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 italic">Courses</p>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-left">Total Spent</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black tracking-tight text-white">
                    ₹{((student.payments || []).reduce((acc: number, p: any) => acc + (p.amount || 0), 0)).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 italic">Amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
          {/* Active Progress Matrix */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-primary" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enrolled Courses</h2>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <DataTable
                data={student.enrollments || []}
                columns={[
                  {
                    header: "Course",
                    cell: (enrollment: any) => (
                      <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                          {enrollment.course?.thumbnailUrl ? (
                            <img src={enrollment.course.thumbnailUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <BookOpen size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight truncate max-w-[200px]">
                            {enrollment.course?.title}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {enrollment.course?.category || 'Professional'}
                          </p>
                        </div>
                      </div>
                    )
                  },
                  {
                    header: "Progress",
                    cell: (enrollment: any) => (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 w-24">
                          <ProgressBar
                            value={enrollment.progress || 0}
                            variant="indigo"
                            size="sm"
                            showValue={false}
                          />
                        </div>
                        <span className="text-[11px] font-black text-slate-900 tabular-nums">
                          {enrollment.progress || 0}%
                        </span>
                      </div>
                    )
                  },
                  {
                    header: "Status",
                    cell: (enrollment: any) => (
                      <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${enrollment.status === 'COMPLETED'
                        ? 'bg-slate-50 text-slate-900 border-slate-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                        <div className={`size-1 rounded-full ${enrollment.status === 'COMPLETED' ? 'bg-primary' : 'bg-slate-300'}`} />
                        {enrollment.status}
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </div>

          {/* Academic Credentials */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Award size={20} className="text-primary" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Certificates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.certificates?.length > 0 ? (
                student.certificates.map((cert: any) => (
                  <div key={cert.id} className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm group hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                        <Award size={24} />
                      </div>
                      <Link
                        href={`/verify/${cert.code}`}
                        target="_blank"
                        className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {cert.course?.title}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">
                      Certificate ID: <span className="text-slate-900">{cert.code}</span>
                    </p>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-primary" />
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Verified Certificate</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(cert.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-16 text-center">
                  <div className="size-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 mx-auto mb-8 shadow-inner">
                    <Award size={40} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Certificates Yet</h3>
                  <p className="mt-2 text-sm font-medium text-slate-400 italic">This student has not earned any certificates.</p>
                </div>
              )}
            </div>
          </div>

          {/* Fiscal Transactions */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <CreditCard size={20} className="text-primary" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Payment History</h2>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <DataTable
                data={student.payments || []}
                columns={[
                  {
                    header: "Transaction ID",
                    cell: (payment: any) => (
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ORDER_ID</p>
                        <p className="text-xs font-bold text-slate-900 font-mono italic">{payment.razorpayOrderId?.slice(-12) || 'INTERNAL_SYS'}</p>
                      </div>
                    )
                  },
                  {
                    header: "Status",
                    className: "text-center",
                    cell: (payment: any) => (
                      <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${payment.status === 'SUCCESS'
                        ? 'bg-slate-50 text-slate-900 border-slate-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                        {payment.status === 'SUCCESS' ? <CheckCircle2 size={10} className="text-primary" /> : <Clock size={10} />}
                        {payment.status}
                      </div>
                    )
                  },
                  {
                    header: "Date",
                    className: "text-center",
                    cell: (payment: any) => (
                      <div className="flex flex-col items-center">
                        <p className="text-[11px] font-black text-slate-900 tabular-nums">
                          {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Date</p>
                      </div>
                    )
                  },
                  {
                    header: "Amount",
                    className: "text-right",
                    cell: (payment: any) => (
                      <p className="text-base font-black text-slate-900 tracking-tight">
                        ₹{payment.amount?.toLocaleString('en-IN')}
                      </p>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
