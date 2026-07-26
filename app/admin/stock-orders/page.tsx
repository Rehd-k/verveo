'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authHeaders } from '@/lib/fetchAuth';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { StockOrder } from '@/types';

type StatusFilter = 'all' | StockOrder['status'];

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface StockOrderRow {
  id: string;
  quantity: number;
  status: StockOrder['status'];
  notes?: string;
  fulfilledAt?: Date | string;
  createdAt?: Date | string;
  retailer?: { businessName?: string; city?: string };
}

export default function AdminStockOrdersPage() {
  const [orders, setOrders] = useState<StockOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    const query = filter === 'all' ? '' : `?status=${filter}`;
    fetch(`/api/admin/stock-orders${query}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setTotal(d.total || 0);
      })
      .catch(() => toast.error('Failed to load stock orders'));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateOrder = async (id: string, status: 'fulfilled' | 'cancelled') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/stock-orders/${id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === 'fulfilled' ? 'Order fulfilled' : 'Order cancelled');
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: 'retailer',
      label: 'Retailer',
      render: (row: Record<string, unknown>) =>
        (row.retailer as { businessName?: string })?.businessName || '—',
    },
    {
      key: 'city',
      label: 'City',
      render: (row: Record<string, unknown>) =>
        (row.retailer as { city?: string })?.city || '—',
    },
    { key: 'quantity', label: 'Quantity' },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={String(row.status)} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Requested',
      render: (row: Record<string, unknown>) =>
        row.createdAt
          ? new Date(String(row.createdAt)).toLocaleDateString('en-NG')
          : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => {
        if (row.status !== 'pending') return '—';
        const id = String(row.id);
        return (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={updatingId === id}
              onClick={(e) => {
                e.stopPropagation();
                updateOrder(id, 'fulfilled');
              }}
              className="rounded-lg bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
            >
              Fulfill
            </button>
            <button
              type="button"
              disabled={updatingId === id}
              onClick={(e) => {
                e.stopPropagation();
                updateOrder(id, 'cancelled');
              }}
              className="rounded-lg bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-300 hover:brightness-110/30"
            >
              Cancel
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Stock Orders</h2>
        <p className="text-sm text-muted-foreground">{total} total requests</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === item.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={orders as unknown as Record<string, unknown>[]} />
    </div>
  );
}
