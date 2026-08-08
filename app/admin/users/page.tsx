'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/store/adminStore';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function AdminUsersPage() {
  const router = useRouter();
  const { users, usersTotal, fetchUsers, adminFetch } = useAdmin();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'advertiser' });

  useEffect(() => {
    fetchUsers({ search, role: roleFilter || undefined });
  }, [fetchUsers, search, roleFilter]);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      toast.success('Role updated');
      fetchUsers({ search, role: roleFilter || undefined });
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminFetch(`/api/admin/users/${deleteId}`, { method: 'DELETE' });
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers({ search, role: roleFilter || undefined });
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      toast.success('User created');
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'advertiser' });
      fetchUsers({ search, role: roleFilter || undefined });
    } catch {
      toast.error('Failed to create user');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row: Record<string, unknown>) => (
        <select
          value={row.role as string}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleRoleChange(row.id as string, e.target.value)}
          className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
        >
          <option value="advertiser">advertiser</option>
          <option value="retailer">retailer</option>
          <option value="admin">admin</option>
        </select>
      ),
    },
    {
      key: 'walletBalance',
      label: 'Business Wallet',
      render: (row: Record<string, unknown>) => `₦${((row.walletBalance as number) || 0).toLocaleString()}`,
    },
    {
      key: 'designCredit',
      label: 'Design Credit',
      render: (row: Record<string, unknown>) => `₦${((row.designCredit as number) || 0).toLocaleString()}`,
    },
    { key: 'campaignCount', label: 'Campaigns' },
    {
      key: 'actions',
      label: '',
      render: (row: Record<string, unknown>) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteId(row.id as string); }}
          className="text-xs text-destructive hover:underline"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">{usersTotal} total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Create User
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="">All roles</option>
          <option value="advertiser">Advertiser</option>
          <option value="retailer">Retailer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={users.map((u) => ({ ...u, id: u.id || u._id })) as Record<string, unknown>[]}
        onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete User"
        message="This will permanently delete the user account."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Create User</h3>
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground" />
            <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
              <option value="advertiser">Advertiser</option>
              <option value="retailer">Retailer</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
