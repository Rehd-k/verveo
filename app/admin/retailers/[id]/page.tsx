'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authHeaders } from '@/lib/fetchAuth';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { VENUE_CATEGORIES } from '@/lib/locationTargeting';
import { RETAILER_CITIES } from '@/lib/retailerCities';
import type { Proof, StockOrder } from '@/types';

interface RetailerDetail {
  id?: string;
  businessName: string;
  venueType: string;
  city?: string;
  status?: string;
  address?: string;
  allowance: number;
  currentStock: number;
  location?: { lat: number; lng: number };
  user?: { email: string; name: string };
}

export default function AdminRetailerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [retailer, setRetailer] = useState<RetailerDetail | null>(null);
  const [orders, setOrders] = useState<StockOrder[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [status, setStatus] = useState('pending');
  const [venueType, setVenueType] = useState('');
  const [city, setCity] = useState('');

  const load = () => {
    fetch(`/api/admin/retailers/${id}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setRetailer(data);
        setStatus(data.status || 'pending');
        setVenueType(data.venueType || '');
        setCity(data.city || '');
      })
      .catch(() => toast.error('Failed to load'));

    fetch(`/api/admin/stock-orders?status=pending`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const retailerOrders = (data.orders || []).filter(
          (order: StockOrder & { retailerId?: string }) => order.retailerId === id
        );
        setOrders(retailerOrders);
      })
      .catch(() => {});

    fetch('/api/admin/proofs', { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const retailerProofs = (data.proofs || []).filter(
          (proof: Proof) => proof.retailerId === id
        );
        setProofs(retailerProofs);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [id]);

  const patch = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/admin/retailers/${id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRetailer((r) => (r ? { ...r, ...data } : r));
      toast.success('Updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const updateOrder = async (orderId: string, orderStatus: 'fulfilled' | 'cancelled') => {
    try {
      const res = await fetch(`/api/admin/stock-orders/${orderId}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: orderStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(orderStatus === 'fulfilled' ? 'Order fulfilled' : 'Order cancelled');
      load();
    } catch {
      toast.error('Order update failed');
    }
  };

  if (!retailer) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link href="/admin/retailers" className="text-sm text-primary hover:underline">
        ← Back to retailers
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{retailer.businessName}</h2>
            <p className="text-muted-foreground">{retailer.venueType}</p>
            {retailer.user && (
              <p className="mt-1 text-sm">
                {retailer.user.name} · {retailer.user.email}
              </p>
            )}
            {retailer.address && (
              <p className="mt-2 text-sm text-muted-foreground">{retailer.address}</p>
            )}
          </div>
          <StatusBadge status={retailer.status || 'pending'} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <div className="mt-1 flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="pending">pending</option>
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </select>
              <button
                onClick={() => patch({ status })}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Venue type</label>
            <div className="mt-1 flex gap-2">
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                {VENUE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                onClick={() => patch({ venueType })}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">City</label>
            <div className="mt-1 flex gap-2">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                {RETAILER_CITIES.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
              <button
                onClick={() => patch({ city })}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Allowance</label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                defaultValue={retailer.allowance}
                id="allowance"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              />
              <button
                onClick={() =>
                  patch({
                    allowance: Number(
                      (document.getElementById('allowance') as HTMLInputElement).value
                    ),
                  })
                }
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Current Stock</label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                defaultValue={retailer.currentStock}
                id="stock"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              />
              <button
                onClick={() =>
                  patch({
                    currentStock: Number(
                      (document.getElementById('stock') as HTMLInputElement).value
                    ),
                  })
                }
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {retailer.location && (
          <p className="mt-4 text-sm text-muted-foreground">
            Location: {retailer.location.lat}, {retailer.location.lng}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Pending stock orders</h3>
          <Link href="/admin/stock-orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No pending stock orders.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div
                key={order.id || order._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{order.quantity.toLocaleString()} packs</p>
                  <p className="text-xs text-muted-foreground">{order.notes || 'No notes'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateOrder(order.id || order._id || '', 'fulfilled')}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300"
                  >
                    Fulfill
                  </button>
                  <button
                    onClick={() => updateOrder(order.id || order._id || '', 'cancelled')}
                    className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Proofs</h3>
          <Link href="/admin/proofs" className="text-sm text-primary hover:underline">
            Review queue
          </Link>
        </div>
        {proofs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No proofs submitted yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proofs.slice(0, 6).map((proof) => (
              <div key={proof.id || proof._id} className="overflow-hidden rounded-lg border border-border">
                <div
                  className="aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url(${proof.imageUrl})` }}
                />
                <div className="flex items-center justify-between p-3">
                  <p className="text-xs text-muted-foreground">
                    {proof.createdAt
                      ? new Date(proof.createdAt).toLocaleDateString('en-NG')
                      : '—'}
                  </p>
                  <StatusBadge status={proof.status || 'pending'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
