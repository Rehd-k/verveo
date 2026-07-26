'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { authHeaders } from '@/lib/fetchAuth';
import { useAuth } from '@/store/authStore';

export default function UserSettingsPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (name.trim() && name !== user?.name) body.name = name.trim();
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      if (Object.keys(body).length === 0) {
        toast.error('No changes to save');
        return;
      }

      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile');
        return;
      }

      setUser(data.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account profile and password.</p>

      <form
        onSubmit={handleSave}
        className="mx-auto mt-6 max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="mt-1 text-sm font-medium text-foreground">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="mt-1 text-sm font-medium capitalize text-foreground">{user?.role || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Wallet balance</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              ₦{(user?.walletBalance ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        <label className="block text-sm font-medium text-muted-foreground">
          Display name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
          />
        </label>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">Change password</p>
          <p className="mt-1 text-xs text-muted-foreground">Leave blank to keep your current password.</p>

          <label className="mt-4 block text-sm font-medium text-muted-foreground">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-muted-foreground">
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-muted-foreground">
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-blue-400 disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
