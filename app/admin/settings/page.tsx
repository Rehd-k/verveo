'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authHeaders } from '@/lib/fetchAuth';
import type { PlatformSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [env, setEnv] = useState<Record<string, unknown>>({});
  const [pricing, setPricing] = useState({ cup: 400, box: 450, bag: 400, 'pizza-box': 450 });
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings);
        setEnv(d.env);
        if (d.settings?.productPricing) setPricing(d.settings.productPricing);
        setMaintenanceMode(d.settings?.maintenanceMode ?? false);
      })
      .catch(() => toast.error('Failed to load settings'));
  }, []);

  const save = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ productPricing: pricing, maintenanceMode }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (!settings) return <div className="text-text-secondary">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-bold text-white">Platform Settings</h2>

      <div className="rounded-xl border border-white/10 bg-card-dark p-5 space-y-4">
        <h3 className="font-semibold text-white">Product Pricing (₦ per unit)</h3>
        {(['cup', 'box', 'bag', 'pizza-box'] as const).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm capitalize text-text-secondary">{key}</label>
            <input
              type="number"
              value={pricing[key]}
              onChange={(e) => setPricing({ ...pricing, [key]: Number(e.target.value) })}
              className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white text-right"
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-card-dark p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="size-4 rounded"
          />
          <div>
            <p className="font-medium text-white">Maintenance Mode</p>
            <p className="text-xs text-text-secondary">Blocks new campaign creation for advertisers</p>
          </div>
        </label>
      </div>

      <div className="rounded-xl border border-white/10 bg-card-dark p-5 space-y-2 text-sm">
        <h3 className="font-semibold text-white">Environment (read-only)</h3>
        <div className="flex justify-between"><span className="text-text-secondary">Paystack</span><span>{env.paystackConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Flutterwave</span><span>{env.flutterwaveConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Bank transfer</span><span>{env.bankTransferConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Mapbox</span><span>{env.mapboxConfigured ? 'Configured' : 'Not configured'}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">App URL</span><span className="truncate max-w-xs">{String(env.appUrl || '—')}</span></div>
      </div>

      <button onClick={save} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background-dark hover:brightness-110">
        Save Settings
      </button>
    </div>
  );
}
