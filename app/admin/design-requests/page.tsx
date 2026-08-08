'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/store/adminStore';
import { DataTable } from '@/components/admin/DataTable';

type DesignRequestRow = {
  id: string;
  user?: { name?: string; email?: string };
  campaign?: { title?: string };
  containerDescription: string;
  preferredContact: string;
  contactValue: string;
  scheduledAt: string;
  status: string;
  amountCharged: number;
  createdAt?: string;
};

export default function AdminDesignRequestsPage() {
  const { adminFetch } = useAdmin();
  const [requests, setRequests] = useState<DesignRequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const data = await adminFetch<{ requests: DesignRequestRow[]; total: number }>(
        `/api/admin/design-requests${qs}`
      );
      setRequests(data.requests || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load design requests');
    } finally {
      setLoading(false);
    }
  }, [adminFetch, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminFetch(`/api/admin/design-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Request updated');
      load();
    } catch {
      toast.error('Failed to update request');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row: Record<string, unknown>) => {
        const user = row.user as { name?: string; email?: string } | undefined;
        return user?.email || user?.name || '—';
      },
    },
    {
      key: 'campaign',
      label: 'Campaign',
      render: (row: Record<string, unknown>) =>
        (row.campaign as { title?: string } | undefined)?.title || '—',
    },
    {
      key: 'containerDescription',
      label: 'Brief',
      render: (row: Record<string, unknown>) => {
        const text = (row.containerDescription as string) || '';
        return text.length > 60 ? `${text.slice(0, 60)}…` : text || '—';
      },
    },
    {
      key: 'preferredContact',
      label: 'Contact',
      render: (row: Record<string, unknown>) => {
        const method = String(row.preferredContact || '').replace('_', ' ');
        return (
          <div className="text-xs">
            <p className="capitalize font-medium">{method}</p>
            <p className="text-muted-foreground">{String(row.contactValue || '')}</p>
          </div>
        );
      },
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled',
      render: (row: Record<string, unknown>) =>
        row.scheduledAt ? new Date(row.scheduledAt as string).toLocaleString() : '—',
    },
    {
      key: 'amountCharged',
      label: 'Charged',
      render: (row: Record<string, unknown>) =>
        `₦${((row.amountCharged as number) || 0).toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <select
          value={row.status as string}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => updateStatus(row.id as string, e.target.value)}
          className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
        >
          <option value="pending">pending</option>
          <option value="contacted">contacted</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row: Record<string, unknown>) =>
        row.createdAt ? new Date(row.createdAt as string).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Design Requests</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading…' : `${total} total`} — Verveo pro container design bookings
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <DataTable columns={columns} rows={requests as unknown as Record<string, unknown>[]} />
    </div>
  );
}
