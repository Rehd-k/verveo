'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAdmin } from '@/store/adminStore';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';

export default function AdminCampaignsPage() {
  const router = useRouter();
  const { campaigns, campaignsTotal, fetchCampaigns } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCampaigns({ search, status: statusFilter || undefined });
  }, [fetchCampaigns, search, statusFilter]);

  const rows = campaigns.map((c) => ({
    ...c,
    id: c.id || c._id,
  })) as Record<string, unknown>[];

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'owner',
      label: 'Owner',
      render: (row: Record<string, unknown>) => {
        const owner = row.owner as { email?: string } | undefined;
        return owner?.email || '—';
      },
    },
    { key: 'productType', label: 'Product' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'budget',
      label: 'Budget',
      render: (row: Record<string, unknown>) => `₦${((row.budget as number) || 0).toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => <StatusBadge status={row.status as string} />,
    },
    {
      key: 'scans',
      label: 'Scans',
      render: (row: Record<string, unknown>) => {
        const stats = row.stats as { scans?: number } | undefined;
        return stats?.scans ?? 0;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Campaigns</h2>
        <p className="text-sm text-text-secondary">{campaignsTotal} total</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-text-secondary focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white sm:w-auto"
        >
          <option value="">All statuses</option>
          {['draft', 'processing', 'printing', 'dispatched', 'live', 'completed'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-card-dark p-8 text-center text-text-secondary">
            No data
          </div>
        ) : (
          rows.map((row) => {
            const owner = row.owner as { email?: string } | undefined;
            const stats = row.stats as { scans?: number } | undefined;
            const id = row.id as string;

            return (
              <button
                key={id}
                type="button"
                onClick={() => router.push(`/admin/campaigns/${id}`)}
                className="w-full rounded-xl border border-white/10 bg-card-dark p-4 text-left transition-colors hover:border-white/20 hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white truncate">{String(row.title)}</h3>
                  <StatusBadge status={row.status as string} />
                </div>
                <p className="mt-1 text-xs text-text-secondary truncate">{owner?.email || '—'}</p>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-text-secondary">Product</span>
                    <p className="font-medium text-white">{String(row.productType)}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Qty</span>
                    <p className="font-medium text-white">{String(row.quantity)}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Budget</span>
                    <p className="font-medium text-white">₦{((row.budget as number) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Scans</span>
                    <p className="font-medium text-white">{stats?.scans ?? 0}</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={(row) => router.push(`/admin/campaigns/${row.id}`)}
        />
      </div>
    </div>
  );
}
