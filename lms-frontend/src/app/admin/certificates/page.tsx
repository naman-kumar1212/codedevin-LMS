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
      <div className="max-w-7xl mx-auto space-y-10 p-6 lg:p-10 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-200/60 rounded-md animate-pulse" />
          </div>
          <div className="h-24 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
        </div>
        <div className="h-20 w-full bg-slate-200/60 rounded-xl animate-pulse border border-slate-200/60" />
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
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
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-6 lg:p-10">
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Awards</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Manage institutional achievements, verify credential issuance, and maintain the integrity of professional certifications.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <StatCard 
            title="Total Issued" 
            value={certificates?.length || 0} 
            icon={Award} 
            trend="up"
            className="w-48 bg-white border border-slate-100 shadow-sm"
          />
          <Button 
            className="h-10 px-4 rounded-md text-sm font-medium shadow-sm transition-colors gap-2 bg-primary text-white border-none hover:bg-primary/90"
          >
            <FileCheck className="size-4" />
            Verify Credential
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Search by code, student name, or course title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 border-none rounded-md py-2 pl-10 pr-4 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button variant="outline" className="h-10 px-4 rounded-md border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm font-medium text-sm gap-2 bg-white">
            <Building className="size-4" />
            Issuers
          </Button>
          <Button variant="outline" size="icon" className="size-10 bg-white border border-slate-200 text-primary rounded-md flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Registry Table */}
      {filteredCertificates && filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/60 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
            <Award className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No credentials found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm">
            No certificates were found matching your verification query "<span className="text-slate-900">{search}</span>".
          </p>
          <Button 
            variant="ghost"
            onClick={() => setSearch('')}
            className="mt-6 text-sm font-medium text-primary hover:bg-primary/5 px-6 h-10 rounded-md"
          >
            Clear Query
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <DataTable
            data={filteredCertificates || []}
            columns={[
              {
                header: "Academic Award",
                cell: (cert: any) => (
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-md bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shadow-sm">
                      <Award className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 font-mono uppercase">{cert.certificateCode}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-medium text-slate-500">Master Identifier</span>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                header: "Academic Achievement",
                cell: (cert: any) => (
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <GraduationCap className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{cert.course.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">100% Core Mastery</p>
                    </div>
                  </div>
                )
              },
              {
                header: "Stakeholder",
                cell: (cert: any) => (
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-full border border-slate-200">
                      <AvatarFallback className="bg-slate-50 text-slate-600 font-medium text-xs">
                        {cert.student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{cert.student.name}</p>
                      <p className="text-xs text-slate-500">{cert.student.email}</p>
                    </div>
                  </div>
                )
              },
              {
                header: "Issuance",
                className: "text-center",
                cell: (cert: any) => (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50/50 border border-slate-100/50 rounded-md">
                      <Calendar className="size-3 text-slate-400" />
                      <p className="text-sm font-bold text-slate-900 tabular-nums">
                        {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-slate-400 mt-1">Official Release</p>
                  </div>
                )
              },
              {
                header: "Governance",
                className: "text-right",
                cell: (cert: any) => (
                  <div className="flex items-center justify-end gap-2">
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
                      className="size-8 rounded-md border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 transition-colors shadow-sm bg-white"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-8 rounded-md border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm bg-white"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )
              }
            ]}
          />

          {/* Registry Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Credential Dynamics: <span className="text-slate-900">{filteredCertificates?.length || 0}</span> Validated Awards
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled className="size-8 rounded-md border-slate-100 text-slate-300 bg-white">
                <ChevronLeft className="size-4" />
              </Button>
              <div className="size-8 flex items-center justify-center rounded-md bg-primary text-white text-xs font-medium shadow-sm">1</div>
              <Button variant="outline" size="icon" disabled className="size-8 rounded-md border-slate-100 text-slate-300 bg-white">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
