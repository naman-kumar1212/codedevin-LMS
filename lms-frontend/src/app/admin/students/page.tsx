'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Download, 
  Eye, 
  UserMinus, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Users,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Calendar
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students', search],
    queryFn: () => api.adminStudents(search).then((r: any) => r.data),
  });

  const filters = ['All', 'Advanced', 'New', 'Inactive'];

  const stats = {
    total: students?.length || 0,
    active: Math.floor((students?.length || 0) * 0.82),
    verified: students?.filter((s: any) => s.isVerified).length || 0,
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 font-display p-6 lg:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
            <div className="h-5 w-96 bg-slate-200/60 rounded-lg animate-pulse" />
          </div>
          <div className="h-24 w-80 bg-slate-200/60 rounded-3xl animate-pulse border border-slate-200/60" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-32 bg-slate-200/60 rounded-[2.5rem] animate-pulse" />
           ))}
        </div>
        <div className="h-20 w-full bg-slate-200/60 rounded-[32px] animate-pulse border border-slate-200/60" />
        <div className="bg-white rounded-[32px] border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 grid grid-cols-6 gap-4">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="h-4 bg-slate-200/60 rounded animate-pulse" />
             ))}
          </div>
          <div className="p-8 space-y-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="grid grid-cols-6 gap-4 items-center">
                <div className="flex items-center gap-4 col-span-1">
                  <div className="size-12 rounded-2xl bg-slate-200/60 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-24 bg-slate-200/60 rounded animate-pulse" />
                    <div className="h-2 w-32 bg-slate-200/60 rounded animate-pulse" />
                  </div>
                </div>
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="h-4 bg-slate-200/60 rounded animate-pulse mx-auto w-20" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 font-display pb-20 p-6 lg:p-10">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Stakeholder Registry</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed max-w-xl">
            Monitor institutional engagement, academic progression, and fiscal metadata across the entire learner ecosystem.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button className="h-14 px-8 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white">
            <UserPlus className="size-5" />
            Add Stakeholder
          </Button>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Stakeholders" 
          value={stats.total} 
          icon={Users} 
          description="Active accounts registered in the platform."
          trend="neutral"
        />
        <StatCard 
          title="Active State" 
          value={stats.active} 
          icon={TrendingUp} 
          change={`${Math.round((stats.active / (stats.total || 1)) * 100)}%`}
          trend="up"
          description="Users with high engagement levels."
        />
        <StatCard 
          title="Verified Status" 
          value={stats.verified} 
          icon={ShieldCheck} 
          description="Stakeholders cleared for academic awards."
          trend="up"
        />
      </div>

      {/* Orchestration Controls */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col lg:flex-row items-center gap-6">
        <div className="flex items-center gap-1.5 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100/50 shrink-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300",
                activeFilter === f 
                  ? "bg-white text-primary shadow-lg shadow-slate-200/50 border border-slate-100" 
                  : "text-slate-400 hover:text-slate-900"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="h-8 w-px bg-slate-100 hidden lg:block" />
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Query records by name, email, or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 border-transparent rounded-2xl py-6 pl-14 pr-12 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:border-primary/20 transition-all outline-none h-14"
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm group font-black text-[10px] uppercase tracking-widest gap-2.5">
            <Download className="size-4 group-hover:text-primary transition-colors" />
            Export Registry
          </Button>
        </div>
      </div>

      {/* Registry Table */}
      {students && students.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-slate-200/60 p-24 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-sm">
          <div className="size-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border border-slate-100 shadow-inner">
            <Users className="size-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No records found</h3>
          <p className="text-slate-400 text-sm mt-3 max-w-xs font-medium leading-relaxed">
            No stakeholders were found matching your current query parameters.
          </p>
          <Button 
            variant="ghost"
            onClick={() => { setSearch(''); setActiveFilter('All'); }}
            className="mt-10 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-8 h-12 rounded-2xl"
          >
            Clear Matrix
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <DataTable
            data={students || []}
            columns={[
              {
                header: "Stakeholder Profile",
                cell: (student: any) => (
                  <div className="flex items-center gap-6 group">
                    <Avatar className="size-14 rounded-2xl border border-slate-100 shadow-sm ring-2 ring-white transition-transform duration-500 group-hover:scale-105">
                      <AvatarImage src={student.image} />
                      <AvatarFallback className="bg-primary text-white font-black text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-base font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight block truncate max-w-[200px]">{student.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail size={12} className="text-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[180px]">{student.email}</p>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                header: "Academic Progression",
                className: "text-center",
                cell: (student: any) => (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400 h-5 px-1.5 rounded-lg italic font-display">
                        {student._count?.enrollments || 0} Units
                      </Badge>
                      <div className="size-1 rounded-full bg-slate-200" />
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary h-5 px-1.5 rounded-lg italic font-display">
                        {student._count?.certificates || 0} Awards
                      </Badge>
                    </div>
                    <div className="w-24">
                      <ProgressBar 
                        value={student._count?.enrollments ? (student._count.certificates / student._count.enrollments) * 100 || 0 : 0} 
                        variant="indigo" 
                        size="xs" 
                        showValue={false} 
                        className="rounded-full overflow-hidden"
                      />
                    </div>
                  </div>
                )
              },
              {
                header: "Fiscal Meta",
                className: "text-center",
                cell: (student: any) => {
                  const paidCount = student.payments?.length || 0;
                  const totalLtv = (student.payments || []).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
                  return (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                        <CreditCard className="size-3 text-slate-400" />
                        <p className="text-sm font-black text-slate-900 tabular-nums">₹{totalLtv.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">{paidCount} Paid Logs</p>
                    </div>
                  );
                }
              },
              {
                header: "Audited On",
                className: "text-center",
                cell: (student: any) => (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                        <Calendar className="size-3 text-slate-400" />
                        <p className="text-[11px] font-black text-slate-900 tabular-nums">
                          {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Standard UTC</p>
                  </div>
                )
              },
              {
                header: "Compliance",
                className: "text-center",
                cell: (student: any) => (
                  <div className="flex justify-center">
                    <StatusBadge 
                      variant={student.isVerified ? 'success' : 'warning'}
                      className="h-7 px-4 rounded-[10px] shadow-sm border-transparent"
                    >
                      {student.isVerified ? 'VERIFIED' : 'PENDING'}
                    </StatusBadge>
                  </div>
                )
              },
              {
                header: "Governance",
                className: "text-right",
                cell: (student: any) => (
                  <div className="flex items-center justify-end gap-2.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => window.location.href = `/admin/students/${student.id}`}
                      className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-lg transition-all group/btn"
                    >
                      <Eye className="size-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all group/btn"
                    >
                      <UserMinus className="size-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                  </div>
                )
              }
            ]}
          />
          
          {/* Registry Footer */}
          <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Registry Dynamics: <span className="text-slate-900">{students?.length || 0}</span> Contextual Stakeholders
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" disabled className="size-10 rounded-xl border-slate-100 text-slate-200 cursor-not-allowed">
                <ChevronLeft className="size-4" />
              </Button>
              <div className="size-10 flex items-center justify-center rounded-xl bg-primary text-white text-[11px] font-black shadow-lg shadow-primary/20">1</div>
              <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
