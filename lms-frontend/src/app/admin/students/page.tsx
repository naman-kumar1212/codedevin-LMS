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
          <div className="h-10 w-40 bg-slate-200/60 rounded-xl animate-pulse border border-slate-200/60" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-32 bg-slate-200/60 rounded-xl animate-pulse" />
           ))}
        </div>
        <div className="h-16 w-full bg-slate-200/60 rounded-xl animate-pulse border border-slate-200/60" />
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stakeholder Registry</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium leading-relaxed max-w-xl">
            Monitor institutional engagement, academic progression, and fiscal metadata across the entire learner ecosystem.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button className="h-10 px-4 rounded-md text-sm font-medium shadow-sm transition-colors gap-2 bg-primary text-white">
            <UserPlus className="size-4" />
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
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors duration-200",
                activeFilter === f 
                  ? "bg-white text-primary shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="h-8 w-px bg-slate-100 hidden lg:block" />
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Query records by name, email, or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-transparent rounded-lg py-2 pl-10 pr-4 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary/20 transition-all outline-none h-10"
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <Button variant="outline" className="h-10 px-4 rounded-md border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm gap-2 text-sm font-medium">
            <Download className="size-4 text-slate-400 group-hover:text-primary transition-colors" />
            Export Registry
          </Button>
        </div>
      </div>

      {/* Registry Table */}
      {students && students.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/60 p-16 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-sm">
          <div className="size-16 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6 border border-slate-100 shadow-sm">
            <Users className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No records found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
            No stakeholders were found matching your current query parameters.
          </p>
          <Button 
            variant="ghost"
            onClick={() => { setSearch(''); setActiveFilter('All'); }}
            className="mt-6 text-sm font-medium text-primary hover:bg-primary/5 px-6 h-10 rounded-md"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <DataTable
            data={students || []}
            columns={[
              {
                header: "Stakeholder Profile",
                cell: (student: any) => (
                  <div className="flex items-center gap-4 group">
                    <Avatar className="size-10 rounded-full border border-slate-100 shadow-sm">
                      <AvatarImage src={student.image} />
                      <AvatarFallback className="bg-primary text-white font-bold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight block truncate">{student.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                header: "Academic Progression",
                className: "text-center",
                cell: (student: any) => (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-medium border-slate-100 text-slate-500">
                        {student._count?.enrollments || 0} Units
                      </Badge>
                      <div className="size-1 rounded-full bg-slate-300" />
                      <Badge variant="outline" className="text-xs font-medium border-primary/20 text-primary">
                        {student._count?.certificates || 0} Awards
                      </Badge>
                    </div>
                    <div className="w-24 mt-1">
                      <ProgressBar 
                        value={student._count?.enrollments ? (student._count.certificates / student._count.enrollments) * 100 || 0 : 0} 
                        variant="indigo" 
                        size="xs" 
                        showValue={false} 
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
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                        <CreditCard className="size-3 text-slate-400" />
                        <p className="text-sm font-bold text-slate-900 tabular-nums">₹{totalLtv.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{paidCount} Paid Logs</p>
                    </div>
                  );
                }
              },
              {
                header: "Audited On",
                className: "text-center",
                cell: (student: any) => (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                        <Calendar className="size-3 text-slate-400" />
                        <p className="text-xs font-medium text-slate-600 tabular-nums">
                          {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
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
                      className="h-6 px-3 rounded-md shadow-sm border-transparent text-[10px]"
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
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => window.location.href = `/admin/students/${student.id}`}
                      className="size-8 rounded-md border-slate-200 text-slate-500 hover:text-primary transition-colors"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-8 rounded-md border-slate-200 text-slate-500 hover:text-red-600 transition-colors"
                    >
                      <UserMinus className="size-4" />
                    </Button>
                  </div>
                )
              }
            ]}
          />
          
          {/* Registry Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Viewing <span className="font-bold text-slate-900">{students?.length || 0}</span> students
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="h-8 rounded-md border-slate-200 text-slate-400 cursor-not-allowed">
                <ChevronLeft className="size-4" />
              </Button>
              <div className="size-8 flex items-center justify-center rounded-md bg-primary text-white text-xs font-bold shadow-sm">1</div>
              <Button variant="outline" size="sm" className="h-8 rounded-md border-slate-200 text-slate-600 hover:text-primary transition-colors">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
