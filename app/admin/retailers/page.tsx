'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { authHeaders } from '@/lib/fetchAuth';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface RetailerRow {
  id: string;
  businessName: string;
  venueType: string;
  city?: string;
  status?: string;
  allowance: number;
  currentStock: number;
  user?: { email?: string };
}

export default function AdminRetailersPage() {
  const router = useRouter();
  const [retailers, setRetailers] = useState<RetailerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    userId: '', businessName: '', venueType: '', city: 'Abuja', status: 'pending', address: '', allowance: 0, currentStock: 0,
  });

  const load = () => {
    const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
    fetch(`/api/admin/retailers${query}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setRetailers(d.retailers); setTotal(d.total); })
      .catch(() => toast.error('Failed to load retailers'));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/retailers', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Retailer created');
      setShowCreate(false);
      load();
    } catch {
      toast.error('Failed to create retailer');
    }
  };

  const columns = [
    { key: 'businessName', label: 'Business' },
    { key: 'venueType', label: 'Venue Type' },
    { key: 'city', label: 'City' },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => <StatusBadge status={String(row.status || 'pending')} />,
    },
    {
      key: 'user',
      label: 'User',
      render: (row: Record<string, unknown>) => (row.user as { email?: string })?.email || '—',
    },
    { key: 'allowance', label: 'Allowance' },
    { key: 'currentStock', label: 'Stock' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Retailers</h2>
          <p className="text-sm text-text-secondary">{total} total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark">
          <Plus className="size-4" /> Add Retailer
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'active', 'suspended'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
              statusFilter === status
                ? 'bg-primary text-white'
                : 'border border-white/10 bg-card-dark text-text-secondary hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        rows={retailers as unknown as Record<string, unknown>[]}
        onRowClick={(row) => router.push(`/admin/retailers/${row.id}`)}
      />
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-xl border border-white/10 bg-card-dark p-6 space-y-3">
            <h3 className="text-lg font-bold text-white">Add Retailer</h3>
            <input required placeholder="User ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <input required placeholder="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <input required placeholder="Venue Type" value={form.venueType} onChange={(e) => setForm({ ...form, venueType: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
              <option value="pending">pending</option>
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </select>
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <input type="number" placeholder="Allowance" value={form.allowance} onChange={(e) => setForm({ ...form, allowance: Number(e.target.value) })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <input type="number" placeholder="Current Stock" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-white/70">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
