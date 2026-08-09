'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Printer, Truck, Package, Clock } from 'lucide-react';
import { useAdmin } from '@/store/adminStore';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { STATUS_LABELS } from '@/lib/fulfillment/constants';

type QueueItem = {
  id: string;
  title: string;
  status: string;
  productType: string;
  quantity: number;
  locations: string[];
  statusNote?: string;
  expectedAt?: string;
  trackingRef?: string;
  hasDesign: boolean;
  updatedAt?: string;
  owner?: { name: string; email: string };
};

type Counts = {
  processing: number;
  printing: number;
  dispatched: number;
  live: number;
};

const FILTERS = [
  { key: '', label: 'All queue', icon: Package },
  { key: 'processing', label: 'Paid', icon: Clock },
  { key: 'printing', label: 'Printing', icon: Printer },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
] as const;

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminFulfillmentPage() {
  const { adminFetch } = useAdmin();
  const [filter, setFilter] = useState('');
  const [campaigns, setCampaigns] = useState<QueueItem[]>([]);
  const [counts, setCounts] = useState<Counts>({
    processing: 0,
    printing: 0,
    dispatched: 0,
    live: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter ? `?status=${filter}` : '';
      const data = await adminFetch<{ campaigns: QueueItem[]; counts: Counts }>(
        `/api/admin/fulfillment${q}`
      );
      setCampaigns(data.campaigns);
      setCounts(data.counts);
    } catch {
      toast.error('Failed to load fulfillment queue');
    } finally {
      setLoading(false);
    }
  }, [adminFetch, filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Fulfillment</h2>
        <p className="text-sm text-muted-foreground">
          In-house print &amp; dispatch queue — paid campaigns waiting on ops.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {(
          [
            ['processing', counts.processing, 'Paid / queue'],
            ['printing', counts.printing, 'Printing'],
            ['dispatched', counts.dispatched, 'Dispatched'],
            ['live', counts.live, 'Live'],
          ] as const
        ).map(([key, count, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key === 'live' ? '' : key === filter ? '' : key)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              filter === key
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{count}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key || 'all'}
            type="button"
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              filter === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading queue…</p>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No campaigns in this queue.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Expected</th>
                <th className="px-4 py-3 font-medium">Locations</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.owner?.name || c.owner?.email || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {c.productType} × {c.quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {STATUS_LABELS[c.status as keyof typeof STATUS_LABELS] || c.status}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.expectedAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-45 truncate">
                    {c.locations?.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/campaigns/${c.id}`}
                      className="text-primary hover:underline"
                    >
                      Open job
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
