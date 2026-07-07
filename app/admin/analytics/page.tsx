'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAdmin } from '@/store/adminStore';
import { AdminStatCard } from '@/components/admin/AdminStatCard';

type Range = '24h' | '7d' | '30d';

export default function AdminAnalyticsPage() {
  const { platformAnalytics, fetchPlatformAnalytics } = useAdmin();
  const [range, setRange] = useState<Range>('7d');

  useEffect(() => {
    fetchPlatformAnalytics(range);
  }, [fetchPlatformAnalytics, range]);

  if (!platformAnalytics) {
    return <div className="text-text-secondary">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Platform Analytics</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Scans" value={platformAnalytics.totalScans} />
        <AdminStatCard label="Unique Visitors" value={platformAnalytics.uniqueVisitors} />
        <AdminStatCard label="Total Campaigns" value={platformAnalytics.totalCampaigns} />
        <AdminStatCard label="Live Campaigns" value={platformAnalytics.liveCampaigns} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Scans Over Time</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformAnalytics.timeSeries}>
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Top Campaigns</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformAnalytics.topCampaigns}>
                <XAxis dataKey="title" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="scans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Top Locations</h3>
          <div className="space-y-2">
            {platformAnalytics.topLocations.map((loc) => (
              <div key={loc.name} className="flex justify-between text-sm">
                <span className="text-white/80">{loc.name}</span>
                <span className="text-text-secondary">{loc.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-card-dark p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Devices</h3>
          <div className="space-y-2">
            {platformAnalytics.devices.map((d) => (
              <div key={d.os} className="flex justify-between text-sm">
                <span className="text-white/80">{d.os}</span>
                <span className="text-text-secondary">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
