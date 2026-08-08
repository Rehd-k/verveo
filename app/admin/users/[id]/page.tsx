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
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      walletBalance: number;
      designCredit: number;
    };
    campaigns: { _id: string; title: string; status: string; budget: number }[];
    orders: { _id: string; amount: number; status: string }[];
  } | null>(null);
  const [wallet, setWallet] = useState('');
  const [designCredit, setDesignCredit] = useState('');

  useEffect(() => {
    adminFetch<typeof data>(`/api/admin/users/${id}`).then(setData).catch(() => toast.error('Failed to load user'));
  }, [id, adminFetch]);

  const updateBalances = async () => {
    try {
      const body: Record<string, number> = {};
      if (wallet !== '') body.walletBalance = parseFloat(wallet);
      if (designCredit !== '') body.designCredit = parseFloat(designCredit);
      if (Object.keys(body).length === 0) {
        toast.error('Enter a value to update');
        return;
      }
      await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      toast.success('Balances updated');
      const refreshed = await adminFetch<typeof data>(`/api/admin/users/${id}`);
      setData(refreshed);
      setWallet('');
      setDesignCredit('');
    } catch {
      toast.error('Failed to update balances');
    }
  };

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-primary hover:underline">← Back to users</Link>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold text-foreground">{data.user.name}</h2>
        <p className="text-muted-foreground">{data.user.email}</p>
        <div className="mt-3"><StatusBadge status={data.user.role} /></div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Business Wallet (₦)</label>
            <p className="text-[10px] text-muted-foreground">Campaign payments — admin controlled</p>
            <input
              type="number"
              value={wallet || data.user.walletBalance}
              onChange={(e) => setWallet(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Design Credit (₦)</label>
            <p className="text-[10px] text-muted-foreground">Only for Verveo professional design</p>
            <input
              type="number"
              value={designCredit || data.user.designCredit}
              onChange={(e) => setDesignCredit(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            />
          </div>
          <button onClick={updateBalances} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Update balances
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Campaigns ({data.campaigns.length})</h3>
          <div className="space-y-2">
            {data.campaigns.map((c) => (
              <Link key={c._id} href={`/admin/campaigns/${c._id}`} className="flex justify-between rounded-lg bg-card px-3 py-2 text-sm hover:bg-accent">
                <span>{c.title}</span>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Orders ({data.orders.length})</h3>
          <div className="space-y-2">
            {data.orders.map((o) => (
              <div key={o._id} className="flex justify-between rounded-lg bg-card px-3 py-2 text-sm">
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
