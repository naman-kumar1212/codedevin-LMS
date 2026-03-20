'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  CreditCard, 
  Search, 
  Download, 
  Filter, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Banknote,
  Receipt,
  ArrowUpRight,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import Link from 'next/link';

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => api.adminPayments().then((r: any) => r.data),
  });

  const filteredPayments = payments?.filter((payment: any) => 
    payment.paymentId.toLowerCase().includes(search.toLowerCase()) ||
    payment.student.name.toLowerCase().includes(search.toLowerCase()) ||
    payment.course.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 p-8 lg:p-12 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="h-12 w-64 bg-slate-100 rounded-2xl" />
            <div className="h-4 w-96 bg-slate-50 rounded-lg" />
          </div>
          <div className="flex gap-4">
            <div className="h-28 w-48 bg-slate-100 rounded-3xl" />
            <div className="h-28 w-48 bg-slate-100 rounded-3xl" />
          </div>
        </div>
        <div className="h-20 bg-slate-50 rounded-[40px] border border-slate-100" />
        <div className="h-[500px] bg-white rounded-[40px] border border-slate-100" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-8 lg:p-12 animate-in fade-in duration-700 font-display pb-32">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Financial <span className="text-primary italic font-serif">Registry</span></h1>
          <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest max-w-xl leading-relaxed">
            Monitor institutional revenue, reconcile transaction logs, and manage fiscal compliance across the global platform.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`₹${payments?.reduce((acc: number, p: any) => acc + p.amount, 0).toLocaleString()}`} 
            icon={TrendingUp} 
            trend="up"
            className="w-56 bg-white border border-slate-100 shadow-sm"
          />
          <StatCard 
            title="Transactions" 
            value={payments?.length || 0} 
            icon={Receipt} 
            trend="up"
            className="w-48 bg-white border border-slate-100 shadow-sm"
          />
        </div>
      </div>

      {/* Control Surface */}
      <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-primary/5 flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Search by transaction ID, stakeholder identity, or unit..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-7 pl-16 pr-12 text-base font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary hover:border-primary/20 transition-all gap-3 shadow-sm bg-white">
            <Filter className="size-4" />
            Audit Filter
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3">
            <Download className="size-4" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Primary Data Surface */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm shadow-primary/5 overflow-hidden">
        <DataTable
          data={filteredPayments || []}
          columns={[
            {
              header: "Fiscal Identity",
              cell: (payment: any) => (
                <div className="flex items-center gap-6 group">
                  <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all border border-slate-100 group-hover:border-primary/10 shadow-inner">
                    <Banknote className="size-6" />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors uppercase font-mono">{payment.paymentId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Master Record</span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: "Stakeholder",
              cell: (payment: any) => (
                <div className="flex items-center gap-4 group/user py-1">
                  <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-black border border-slate-100 group-hover/user:bg-primary group-hover/user:text-white transition-all">
                    {payment.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-slate-900 tracking-tight">{payment.student.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 lowercase italic opacity-80">{payment.student.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: "Unit / Product",
              cell: (payment: any) => (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                    <ArrowUpRight className="size-4" />
                  </div>
                  <p className="text-[13px] font-black text-slate-600 tracking-tight line-clamp-1 truncate max-w-[200px]">{payment.course.title}</p>
                </div>
              )
            },
            {
              header: "Quantum",
              className: "text-center",
              cell: (payment: any) => (
                <div className="flex flex-col items-center">
                  <p className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] mt-1 italic">Net Settlement</p>
                </div>
              )
            },
            {
              header: "Status",
              cell: (payment: any) => (
                <div className="flex justify-center">
                  <StatusBadge 
                    variant={payment.status === 'COMPLETED' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'secondary'} 
                    className="px-5 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] border-none shadow-sm"
                  >
                    {payment.status}
                  </StatusBadge>
                </div>
              )
            },
            {
              header: "Governance",
              className: "text-right",
              cell: (payment: any) => (
                <div className="flex justify-end gap-2.5">
                  <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all group/btn shadow-sm">
                    <CheckCircle2 className="size-4 group-hover/btn:scale-110 transition-transform" />
                  </Button>
                  <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg transition-all group/btn shadow-sm">
                    <AlertCircle className="size-4 group-hover/btn:scale-110 transition-transform" />
                  </Button>
                </div>
              )
            }
          ]}
        />

        {/* Dynamic Summary Footer */}
        <div className="px-12 py-10 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 opacity-60">
              <RefreshCw className="size-4 text-primary" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flux Registry Sync: <span className="text-slate-900">Active</span></p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing <span className="text-slate-900">{filteredPayments?.length || 0}</span> of <span className="text-slate-900">{payments?.length || 0}</span> Archives
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200/40 shadow-sm">
             <Link href="/admin/dashboard" className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-2">
                <LayoutDashboard size={14} />
                Dashboard
             </Link>
             <div className="w-px h-6 bg-slate-100" />
             <div className="flex items-center gap-2 px-2">
                <Button variant="outline" size="icon" disabled className="size-10 rounded-xl border-slate-100 text-slate-200">
                  <Clock className="size-4" />
                </Button>
                <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center text-[11px] font-black shadow-lg shadow-primary/20">1</div>
                <Button variant="outline" size="icon" disabled className="size-10 rounded-xl border-slate-100 text-slate-200">
                  <ArrowUpRight className="size-4" />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
