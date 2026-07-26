'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { authHeaders } from '@/lib/fetchAuth';
import type { Order } from '@/types';

interface UserOrder extends Order {
  id: string;
  campaignTitle: string;
}

export default function BillingPage() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/orders', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = (order: UserOrder) => {
    if (order.paymentMethod === 'bank_transfer' && order.status === 'pending') {
      return 'Awaiting approval';
    }
    return order.status;
  };

  const methodLabel = (method?: string) => {
    if (!method) return '—';
    return method.replace('_', ' ');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-foreground">Billing</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your payment history and pending proofs.</p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">
            Go to dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-card text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Proof</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border text-muted-foreground">
                  <td className="px-4 py-3">{order.campaignTitle}</td>
                  <td className="px-4 py-3">₦{order.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{methodLabel(order.paymentMethod)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        order.paymentMethod === 'bank_transfer' && order.status === 'pending'
                          ? 'text-amber-400'
                          : order.status === 'paid'
                            ? 'text-success'
                            : ''
                      }
                    >
                      {statusLabel(order)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.proofImageUrl ? (
                      <a
                        href={order.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : '—'}
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
