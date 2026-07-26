'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Users, Megaphone, Wallet, ScanLine, ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAdmin } from '@/store/adminStore';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useChartColors } from '@/hooks/useChartColors';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminOverviewPage() {
  const { stats, fetchStats } = useAdmin();
  const chartColors = useChartColors();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!stats) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  const statusChart = Object.entries(stats.campaignsByStatus).map(([status, count]) => ({
    status,
    count,
  }));

  const tooltipStyle = {
    background: chartColors.card,
    border: `1px solid ${chartColors.border}`,
    borderRadius: 8,
    color: chartColors.foreground,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Platform health at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Users" value={stats.totalUsers} icon={<Users className="size-5" />} />
        <AdminStatCard
          label="Active Campaigns"
          value={stats.activeCampaigns}
          sub={`${stats.totalCampaigns} total`}
          icon={<Megaphone className="size-5" />}
        />
        <AdminStatCard
          label="Revenue"
          value={`₦${stats.totalRevenue.toLocaleString()}`}
          icon={<Wallet className="size-5" />}
        />
        <AdminStatCard
          label="Scans Today"
          value={stats.scansToday}
          sub={`${stats.scans7d} this week`}
          icon={<ScanLine className="size-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Campaigns by Status</h2>
          <div className="h-48 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <XAxis dataKey="status" tick={{ fill: chartColors.muted, fontSize: 10 }} />
                <YAxis tick={{ fill: chartColors.muted, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={chartColors.chart1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Revenue (30d)</h2>
          <div className="h-48 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueByDay}>
                <XAxis dataKey="date" tick={{ fill: chartColors.muted, fontSize: 10 }} />
                <YAxis tick={{ fill: chartColors.muted, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="amount" stroke={chartColors.chart1} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id || order._id}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-foreground">
                    {(order.campaign as { title?: string })?.title || 'Campaign'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {(order.user as { email?: string })?.email}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium">₦{order.amount?.toLocaleString()}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
            {!stats.recentOrders.length && (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/proofs"
              className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning hover:bg-warning/20"
            >
              <ImageIcon className="size-4" />
              {stats.pendingProofs} pending proofs
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm hover:bg-accent"
            >
              <Users className="size-4" />
              Manage users
            </Link>
            <Link
              href="/admin/campaigns"
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm hover:bg-accent"
            >
              <Megaphone className="size-4" />
              All campaigns
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
