'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Users, Megaphone, Wallet, ScanLine, ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAdmin } from '@/store/adminStore';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';

export default function AdminOverviewPage() {
  const { stats, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!stats) {
    return <div className="text-text-secondary">Loading dashboard...</div>;
  }

  const statusChart = Object.entries(stats.campaignsByStatus).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <div className="space-y-6">
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
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Campaigns by Status</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Revenue (30d)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueByDay}>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-card-dark p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.map((order) => (
              <div key={order.id || order._id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <div>
                  <p className="text-white">{(order.campaign as { title?: string })?.title || 'Campaign'}</p>
                  <p className="text-xs text-text-secondary">{(order.user as { email?: string })?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{order.amount?.toLocaleString()}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
            {!stats.recentOrders.length && <p className="text-sm text-text-secondary">No orders yet</p>}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <Link href="/admin/proofs" className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/20">
              <ImageIcon className="size-4" />
              {stats.pendingProofs} pending proofs
            </Link>
            <Link href="/admin/users" className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              <Users className="size-4" />
              Manage users
            </Link>
            <Link href="/admin/campaigns" className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              <Megaphone className="size-4" />
              All campaigns
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
