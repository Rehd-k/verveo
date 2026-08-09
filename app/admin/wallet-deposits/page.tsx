'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/store/adminStore';
import { DataTable } from '@/components/admin/DataTable';

type DepositRow = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  proofImageUrl?: string;
  proofNote?: string;
  createdAt?: string;
  user?: { id: string; email?: string; name?: string } | null;
};

export default function AdminWalletDepositsPage() {
  const { adminFetch } = useAdmin();
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');

  const load = async () => {
    try {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      const data = await adminFetch<{ deposits: DepositRow[]; total: number }>(
        `/api/admin/wallet-deposits${q}`
      );
      setDeposits(data.deposits || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load deposits');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminFetch(`/api/admin/wallet-deposits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Deposit updated');
      load();
    } catch {
      toast.error('Failed to update deposit');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row: Record<string, unknown>) =>
        (row.user as { email?: string } | null)?.email || '—',
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
        const isPendingProof = method === 'bank_transfer' && row.status === 'pending';
        return (
          <span className={isPendingProof ? 'font-medium text-amber-400' : ''}>
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
          className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
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
          <h2 className="text-lg font-bold text-foreground">Wallet Deposits</h2>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <DataTable columns={columns} rows={deposits as unknown as Record<string, unknown>[]} />
    </div>
  );
}
