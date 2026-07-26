'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAdmin } from '@/store/adminStore';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { useChartColors } from '@/hooks/useChartColors';
import { PageHeader } from '@/components/ui/PageHeader';

type Range = '24h' | '7d' | '30d';

export default function AdminAnalyticsPage() {
  const { platformAnalytics, fetchPlatformAnalytics } = useAdmin();
  const [range, setRange] = useState<Range>('7d');
  const chartColors = useChartColors();

  useEffect(() => {
    fetchPlatformAnalytics(range);
  }, [fetchPlatformAnalytics, range]);

  if (!platformAnalytics) {
    return <div className="text-muted-foreground">Loading analytics...</div>;
  }

  const tooltipStyle = {
    background: chartColors.card,
    border: `1px solid ${chartColors.border}`,
    borderRadius: 8,
    color: chartColors.foreground,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        actions={
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
            aria-label="Date range"
          >
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Scans" value={platformAnalytics.totalScans} />
        <AdminStatCard label="Unique Visitors" value={platformAnalytics.uniqueVisitors} />
        <AdminStatCard label="Total Campaigns" value={platformAnalytics.totalCampaigns} />
        <AdminStatCard label="Live Campaigns" value={platformAnalytics.liveCampaigns} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Scans Over Time</h3>
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformAnalytics.timeSeries}>
                <XAxis dataKey="time" tick={{ fill: chartColors.muted, fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                <YAxis tick={{ fill: chartColors.muted, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke={chartColors.chart1} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Top Campaigns</h3>
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformAnalytics.topCampaigns}>
                <XAxis dataKey="title" tick={{ fill: chartColors.muted, fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: chartColors.muted, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="scans" fill={chartColors.chart1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Top Locations</h3>
          <div className="space-y-2">
            {platformAnalytics.topLocations.map((loc) => (
              <div key={loc.name} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{loc.name}</span>
                <span className="text-muted-foreground">{loc.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Devices</h3>
          <div className="space-y-2">
            {platformAnalytics.devices.map((d) => (
              <div key={d.os} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{d.os}</span>
                <span className="text-muted-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
