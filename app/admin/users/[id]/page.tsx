'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAdmin } from '@/store/adminStore';
import { StatusBadge } from '@/components/admin/StatusBadge';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { adminFetch } = useAdmin();
  const [data, setData] = useState<{
    user: { id: string; name: string; email: string; role: string; walletBalance: number };
    campaigns: { _id: string; title: string; status: string; budget: number }[];
    orders: { _id: string; amount: number; status: string }[];
  } | null>(null);
  const [wallet, setWallet] = useState('');

  useEffect(() => {
    adminFetch<typeof data>(`/api/admin/users/${id}`).then(setData).catch(() => toast.error('Failed to load user'));
  }, [id, adminFetch]);

  const updateWallet = async () => {
    try {
      await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletBalance: parseFloat(wallet) }),
      });
      toast.success('Wallet updated');
      const refreshed = await adminFetch<typeof data>(`/api/admin/users/${id}`);
      setData(refreshed);
    } catch {
      toast.error('Failed to update wallet');
    }
  };

  if (!data) return <div className="text-text-secondary">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-primary hover:underline">← Back to users</Link>
      <div className="rounded-xl border border-white/10 bg-card-dark p-6">
        <h2 className="text-xl font-bold text-white">{data.user.name}</h2>
        <p className="text-text-secondary">{data.user.email}</p>
        <div className="mt-3"><StatusBadge status={data.user.role} /></div>
        <div className="mt-4 flex items-end gap-2">
          <div>
            <label className="text-xs text-text-secondary">Wallet Balance (₦)</label>
            <input
              type="number"
              value={wallet || data.user.walletBalance}
              onChange={(e) => setWallet(e.target.value)}
              className="mt-1 block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </div>
          <button onClick={updateWallet} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark">
            Update
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h3 className="mb-3 font-semibold text-white">Campaigns ({data.campaigns.length})</h3>
          <div className="space-y-2">
            {data.campaigns.map((c) => (
              <Link key={c._id} href={`/admin/campaigns/${c._id}`} className="flex justify-between rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                <span>{c.title}</span>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h3 className="mb-3 font-semibold text-white">Orders ({data.orders.length})</h3>
          <div className="space-y-2">
            {data.orders.map((o) => (
              <div key={o._id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span>₦{o.amount.toLocaleString()}</span>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
