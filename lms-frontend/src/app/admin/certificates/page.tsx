'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useState } from 'react';
import { 
  Award, 
  Search, 
  FileCheck, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Calendar,
  Building,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminCertificatesPage() {
  const [search, setSearch] = useState('');

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['admin-certificates'],
    queryFn: () => api.adminCertificates().then((r: any) => r.data),
  });

  const filteredCertificates = certificates?.filter((cert: any) => 
    cert.certificateCode.toLowerCase().includes(search.toLowerCase()) ||
    cert.student.name.toLowerCase().includes(search.toLowerCase()) ||
    cert.course.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 font-display p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-200/60 rounded-md animate-pulse" />
          </div>
          <div className="h-24 w-64 bg-slate-200/60 rounded-2xl animate-pulse" />
        </div>
        <div className="h-20 w-full bg-slate-200/60 rounded-[32px] animate-pulse border border-slate-200/60" />
        <div className="bg-white rounded-[32px] border border-slate-200/60 overflow-hidden shadow-sm">
           <div className="h-12 bg-slate-200/60 border-b border-slate-100 animate-pulse" />
           <div className="p-8 space-y-8">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="h-4 bg-slate-200/60 rounded animate-pulse" />
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 font-display pb-20 p-6 lg:p-10">
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Academic <span className="text-primary italic font-serif">Awards</span></h1>
          <p className="text-slate-500 mt-3 text-sm font-medium max-w-xl leading-relaxed">
            Manage institutional achievements, verify credential issuance, and maintain the integrity of professional certifications.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <StatCard 
            title="Total Issued" 
            value={certificates?.length || 0} 
            icon={Award} 
            trend="up"
            className="w-48 bg-white border border-slate-100"
          />
          <Button 
            className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3 bg-primary text-white"
          >
            <FileCheck className="size-5" />
            Verify Credential
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Search by code, student name, or course title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 border-transparent rounded-2xl py-6 pl-14 pr-12 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:border-primary/20 transition-all outline-none h-14"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm group font-black text-[10px] uppercase tracking-widest gap-2.5">
            <Building className="size-4 group-hover:text-primary transition-colors" />
            Issuers
          </Button>
          <Button variant="outline" size="icon" className="size-14 bg-white border border-slate-200 text-primary rounded-2xl flex items-center justify-center hover:border-primary/30 transition-all shadow-sm group active:scale-95">
            <RefreshCw className="size-5 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        </div>
      </div>

      {/* Registry Table */}
      {filteredCertificates && filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-slate-200/60 p-24 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-sm">
          <div className="size-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border border-slate-100 shadow-inner">
            <Award className="size-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No credentials found</h3>
          <p className="text-slate-400 text-sm mt-3 max-w-xs font-medium leading-relaxed">
            No certificates were found matching your verification query "<span className="text-slate-900">{search}</span>".
          </p>
          <Button 
            variant="ghost"
            onClick={() => setSearch('')}
            className="mt-10 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-8 h-12 rounded-2xl"
          >
            Clear Query
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <DataTable
            data={filteredCertificates || []}
            columns={[
              {
                header: "Academic Award",
                cell: (cert: any) => (
                  <div className="flex items-center gap-6 group">
                    <div className="size-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shadow-sm transition-transform duration-500 group-hover:scale-105">
                      <Award className="size-6" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 font-mono group-hover:text-primary transition-colors tracking-tighter uppercase">{cert.certificateCode}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Identifier</span>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                header: "Academic Achievement",
                cell: (cert: any) => (
                  <div className="flex items-center gap-4 group/course">
                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover/course:bg-primary/5 group-hover/course:text-primary transition-all">
                      <GraduationCap className="size-5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900 tracking-tight line-clamp-1">{cert.course.title}</p>
                      <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mt-1 italic">100% Core Mastery</p>
                    </div>
                  </div>
                )
              },
              {
                header: "Stakeholder",
                cell: (cert: any) => (
                  <div className="flex items-center gap-4">
                    <Avatar className="size-10 rounded-xl border border-slate-100 shadow-sm">
                      <AvatarFallback className="bg-slate-50 text-slate-400 font-black text-xs">
                        {cert.student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[13px] font-black text-slate-900 tracking-tight">{cert.student.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 lowercase tracking-tight italic opacity-70">{cert.student.email}</p>
                    </div>
                  </div>
                )
              },
              {
                header: "Issuance",
                className: "text-center",
                cell: (cert: any) => (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                      <Calendar className="size-3 text-slate-400" />
                      <p className="text-[11px] font-black text-slate-900 tabular-nums">
                        {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Official Release</p>
                  </div>
                )
              },
              {
                header: "Governance",
                className: "text-right",
                cell: (cert: any) => (
                  <div className="flex items-center justify-end gap-2.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        if (cert.pdfUrl) {
                          window.open(`${API_URL}${cert.pdfUrl}`, '_blank');
                        } else {
                          toast.error('Certificate Generation Pending', {
                            description: 'The automated academic validator is still processing this credential.',
                          });
                        }
                      }}
                      className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-lg transition-all group/btn"
                    >
                      <Eye className="size-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all group/btn"
                    >
                      <Trash2 className="size-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                  </div>
                )
              }
            ]}
          />

          {/* Registry Footer */}
          <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 rounded-b-[2.5rem] flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Credential Dynamics: <span className="text-slate-900">{filteredCertificates?.length || 0}</span> Validated Awards
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" disabled className="size-10 rounded-xl border-slate-100 text-slate-200 cursor-not-allowed">
                <ChevronLeft className="size-4" />
              </Button>
              <div className="size-10 flex items-center justify-center rounded-xl bg-primary text-white text-[11px] font-black shadow-lg shadow-primary/20">1</div>
              <Button variant="outline" size="icon" disabled className="size-10 rounded-xl border-slate-100 text-slate-200 cursor-not-allowed">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
