'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/fetchAuth';
import { DataTable } from '@/components/admin/DataTable';

interface ScanRow {
  id: string;
  campaignTitle?: string;
  device: string;
  location: string;
  createdAt: string;
}

export default function AdminScansPage() {
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [campaignId, setCampaignId] = useState('');

  const load = () => {
    const qs = new URLSearchParams();
    if (campaignId) qs.set('campaignId', campaignId);
    fetch(`/api/admin/scans?${qs}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setScans(d.scans); setTotal(d.total); });
  };

  useEffect(() => { load(); }, [campaignId]);

  const columns = [
    { key: 'campaignTitle', label: 'Campaign' },
    { key: 'device', label: 'Device' },
    { key: 'location', label: 'Location' },
    {
      key: 'createdAt',
      label: 'Time',
      render: (row: Record<string, unknown>) =>
        row.createdAt ? new Date(row.createdAt as string).toLocaleString() : '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Scan Feed</h2>
          <p className="text-sm text-text-secondary">{total} total scans</p>
        </div>
        <input
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          placeholder="Filter by campaign ID"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white w-64"
        />
      </div>
      <DataTable columns={columns} rows={scans as unknown as Record<string, unknown>[]} emptyMessage="No scans recorded" />
    </div>
  );
}
