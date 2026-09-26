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
      <div className="max-w-7xl mx-auto space-y-6 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="h-12 w-64 bg-slate-100 rounded-xl" />
            <div className="h-4 w-96 bg-slate-50 rounded-lg" />
          </div>
          <div className="flex gap-4">
            <div className="h-28 w-48 bg-slate-100 rounded-xl" />
            <div className="h-28 w-48 bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="h-20 bg-slate-50 rounded-xl border border-slate-100" />
        <div className="h-[500px] bg-white rounded-xl border border-slate-100" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6 lg:p-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Payments</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
          Monitor student payments and institutional revenue.
        </p>
      </div>

      {/* Stats Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${payments?.reduce((acc: number, p: any) => acc + p.amount, 0).toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Transactions"
          value={payments?.length || 0}
          icon={Receipt}
          trend="up"
        />
      </div>

      {/* Control Surface */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search by transaction ID, student, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-md py-2 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button variant="outline" className="h-10 px-4 rounded-md border-slate-200 text-slate-600 font-medium text-sm hover:text-primary hover:border-primary/20 gap-2 shadow-sm bg-white">
            <Filter className="size-4" />
            Filters
          </Button>
          <Button className="h-10 px-4 rounded-md bg-primary text-white font-medium text-sm shadow-sm hover:bg-primary/90 gap-2 border-none">
            <Download className="size-4" />
            Export Payments
          </Button>
        </div>
      </div>

      {/* Primary Data Surface */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable
          data={filteredPayments || []}
          columns={[
            {
              header: "Payment ID",
              cell: (payment: any) => (
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Banknote className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 uppercase font-mono">{payment.paymentId}</p>
                  </div>
                </div>
              )
            },
            {
              header: "Student",
              cell: (payment: any) => (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-medium border border-slate-200">
                    {payment.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{payment.student.name}</p>
                    <p className="text-xs text-slate-500">{payment.student.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: "Course",
              cell: (payment: any) => (
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-primary/5 text-primary flex items-center justify-center">
                    <ArrowUpRight className="size-3" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 line-clamp-1 truncate max-w-[200px]">{payment.course.title}</p>
                </div>
              )
            },
            {
              header: "Amount",
              className: "text-center",
              cell: (payment: any) => (
                <div className="flex flex-col items-center">
                  <p className="text-base font-bold text-slate-900 tabular-nums">₹{payment.amount.toLocaleString()}</p>
                </div>
              )
            },
            {
              header: "Status",
              cell: (payment: any) => (
                <div className="flex justify-center">
                  <StatusBadge
                    variant={payment.status === 'COMPLETED' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'secondary'}
                    className="px-3 py-1 rounded-md font-medium text-xs border-none shadow-sm capitalize"
                  >
                    {payment.status.toLowerCase()}
                  </StatusBadge>
                </div>
              )
            }
          ]}
        />

        {/* Dynamic Summary Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-slate-500">
            <p className="text-xs font-medium">
              Showing <span className="text-slate-900">{filteredPayments?.length || 0}</span> of <span className="text-slate-900">{payments?.length || 0}</span> Payments
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-slate-200/60 shadow-sm">
            <Link href="/admin/dashboard" className="h-8 px-4 rounded-md text-xs font-medium text-slate-600 hover:text-primary hover:bg-slate-50 flex items-center gap-2">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-1 px-1">
              <Button variant="outline" size="icon" disabled className="size-8 rounded-md border-slate-200 text-slate-400 bg-slate-50">
                <Clock className="size-4" />
              </Button>
              <div className="size-8 rounded-md bg-primary text-white flex items-center justify-center text-xs font-medium shadow-sm">1</div>
              <Button variant="outline" size="icon" disabled className="size-8 rounded-md border-slate-200 text-slate-400 bg-slate-50">
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
