'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/store/adminStore';
import { DataTable } from '@/components/admin/DataTable';

export default function AdminOrdersPage() {
  const { orders, ordersTotal, fetchOrders, adminFetch } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders({ status: statusFilter || undefined });
  }, [fetchOrders, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminFetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Order updated');
      fetchOrders({ status: statusFilter || undefined });
    } catch {
      toast.error('Failed to update order');
    }
  };

  const columns = [
    {
      key: 'campaign',
      label: 'Campaign',
      render: (row: Record<string, unknown>) => (row.campaign as { title?: string })?.title || '—',
    },
    {
      key: 'user',
      label: 'User',
      render: (row: Record<string, unknown>) => (row.user as { email?: string })?.email || '—',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row: Record<string, unknown>) => `₦${((row.amount as number) || 0).toLocaleString()}`,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (row: Record<string, unknown>) => {
        const method = (row.paymentMethod as string) || '—';
        const isPendingProof =
          method === 'bank_transfer' && row.status === 'pending';
        return (
          <span className={isPendingProof ? 'text-amber-400 font-medium' : ''}>
            {method.replace('_', ' ')}
            {isPendingProof ? ' (review)' : ''}
          </span>
        );
      },
    },
    {
      key: 'proofImageUrl',
      label: 'Proof',
      render: (row: Record<string, unknown>) => {
        const url = row.proofImageUrl as string | undefined;
        if (!url) return '—';
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:underline"
          >
            View
          </a>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <select
          value={row.status as string}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => updateStatus(row.id as string, e.target.value)}
          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
        >
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
        </select>
      ),
    },
    { key: 'transactionId', label: 'Transaction ID' },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row: Record<string, unknown>) =>
        row.createdAt ? new Date(row.createdAt as string).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Orders</h2>
          <p className="text-sm text-text-secondary">{ordersTotal} total</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <DataTable columns={columns} rows={orders as unknown as Record<string, unknown>[]} />
    </div>
  );
}
