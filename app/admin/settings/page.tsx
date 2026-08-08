'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authHeaders } from '@/lib/fetchAuth';
import type { PlatformSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [env, setEnv] = useState<Record<string, unknown>>({});
  const [pricing, setPricing] = useState({ cup: 400, box: 450, bag: 400, 'pizza-box': 450 });
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [defaultDesignCredit, setDefaultDesignCredit] = useState(150000);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings);
        setEnv(d.env);
        if (d.settings?.productPricing) setPricing(d.settings.productPricing);
        setBankAccountName(d.settings?.bankAccountName ?? '');
        setBankAccountNumber(d.settings?.bankAccountNumber ?? '');
        setBankName(d.settings?.bankName ?? '');
        setDefaultDesignCredit(d.settings?.defaultDesignCredit ?? 150000);
        setMaintenanceMode(d.settings?.maintenanceMode ?? false);
      })
      .catch(() => toast.error('Failed to load settings'));
  }, []);

  const save = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          productPricing: pricing,
          maintenanceMode,
          bankAccountName,
          bankAccountNumber,
          bankName,
          defaultDesignCredit,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
      setEnv((prev) => ({
        ...prev,
        bankTransferConfigured: !!(
          bankAccountName.trim() &&
          bankAccountNumber.trim() &&
          bankName.trim()
        ),
      }));
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (!settings) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-bold text-foreground">Platform Settings</h2>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Product Pricing (₦ per unit)</h3>
        {(['cup', 'box', 'bag', 'pizza-box'] as const).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm capitalize text-muted-foreground">{key}</label>
            <input
              type="number"
              value={pricing[key]}
              onChange={(e) => setPricing({ ...pricing, [key]: Number(e.target.value) })}
              className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground text-right"
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Signup Design Credit</h3>
        <p className="text-xs text-muted-foreground">
          Granted on signup. Can only pay for Verveo professional container design — not campaign checkout.
        </p>
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm text-muted-foreground">Default Design Credit (₦)</label>
          <input
            type="number"
            value={defaultDesignCredit}
            onChange={(e) => setDefaultDesignCredit(Number(e.target.value))}
            className="w-40 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground text-right"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Bank Transfer Details</h3>
        <p className="text-xs text-muted-foreground">
          Shown to advertisers when they choose bank transfer at checkout.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Account name</label>
            <input
              type="text"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              placeholder="Account name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Account number</label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              placeholder="Account number"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Bank name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              placeholder="Bank name"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="size-4 rounded"
          />
          <div>
            <p className="font-medium text-foreground">Maintenance Mode</p>
            <p className="text-xs text-muted-foreground">Blocks new campaign creation for advertisers</p>
          </div>
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
        <h3 className="font-semibold text-foreground">Environment (read-only)</h3>
        <div className="flex justify-between"><span className="text-muted-foreground">Paystack</span><span>{env.paystackConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Flutterwave</span><span>{env.flutterwaveConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Bank transfer</span><span>{env.bankTransferConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Mapbox</span><span>{env.mapboxConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">App URL</span><span className="truncate max-w-xs">{String(env.appUrl || '—')}</span></div>
      </div>

      <button onClick={save} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110">
        Save Settings
      </button>
    </div>
  );
}
