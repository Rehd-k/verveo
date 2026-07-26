'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '@/store/authStore';
import { authHeaders } from '@/lib/fetchAuth';
import {
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Monitor,
  Activity,
  Smartphone,
  MapPin,
} from 'lucide-react';
import type { CampaignAnalytics } from '@/lib/analytics';
import { NIGERIA_CENTER } from '@/hooks/useMapUserLocation';
import { useChartColors } from '@/hooks/useChartColors';

if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

type AnalyticsRange = '24h' | '7d' | '30d';

interface CampaignOption {
  id: string;
  title: string;
  stats?: { scans?: number };
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

function formatChartTime(iso: string, range: AnalyticsRange): string {
  const date = new Date(iso);
  if (range === '30d') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [range, setRange] = useState<AnalyticsRange>('24h');
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const chartColors = useChartColors();

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/campaigns?userId=${user.id}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = (data || []).map((c: { _id?: string; id?: string; title: string; stats?: { scans?: number } }) => ({
          id: c.id || c._id,
          title: c.title,
          stats: c.stats,
        }));
        setCampaigns(list);
        if (list.length > 0) setSelected(list[0].id);
      })
      .catch((e) => console.error(e));
  }, [user?.id]);

  const fetchAnalytics = useCallback(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/analytics/campaign/${selected}?range=${range}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data?.summary) setAnalytics(data);
        else setAnalytics(null);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [selected, range]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN || !analytics) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      const points = analytics.scanMap;
      const center: [number, number] =
        points.length > 0 ? [points[0].lng, points[0].lat] : [NIGERIA_CENTER.longitude, NIGERIA_CENTER.latitude];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center,
        zoom: points.length > 0 ? 10 : NIGERIA_CENTER.zoom,
      });

      map.current.on('load', () => {
        map.current?.addSource('scans', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: points.map((p) => ({
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            })),
          },
        });

        map.current?.addLayer({
          id: 'scan-points',
          type: 'circle',
          source: 'scans',
          paint: {
            'circle-radius': 8,
            'circle-color': '#FF7A59',
            'circle-opacity': 0.75,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
          },
        });
      });
    } catch (err) {
      console.error('Map load error', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [analytics]);

  const summary = analytics?.summary;
  const chartData = (analytics?.timeSeries || []).map((point) => ({
    ...point,
    label: formatChartTime(point.time, range),
  }));

  const topDevice = analytics?.devices[0];
  const peakHour = analytics?.peakHour;

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden font-display text-foreground">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col md:flex-row">
          <main className="relative flex h-full min-w-0 flex-1 flex-col gap-6 overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground">Campaign Analytics</h1>
                <p className="text-sm text-muted-foreground">Track scans, users, and conversion in real time</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selected || ''}
                  onChange={(e) => setSelected(e.target.value)}
                  className="min-w-0 max-w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-ring sm:min-w-48"
                  disabled={campaigns.length === 0}
                >
                  {campaigns.length === 0 ? (
                    <option value="">No campaigns</option>
                  ) : (
                    campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))
                  )}
                </select>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value as AnalyticsRange)}
                  className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-ring"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>

            {loading && !analytics ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground">Loading analytics...</div>
            ) : !selected || !summary ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground">
                {campaigns.length === 0
                  ? 'Create a campaign to start tracking scans.'
                  : 'No analytics data available yet.'}
              </div>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
                  <div className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/50 sm:p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                        Total Scans
                      </p>
                      <BarChart3 size={20} className="text-primary/50 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-foreground text-4xl font-extrabold tracking-tight">
                        {formatNumber(summary.totalScans)}
                      </p>
                      <span
                        className={`flex items-center text-sm font-bold px-1.5 py-0.5 rounded ${
                          summary.changes.totalScans >= 0
                            ? 'text-success bg-success/10'
                            : 'text-destructive bg-red-500/10'
                        }`}
                      >
                        {summary.changes.totalScans >= 0 ? (
                          <TrendingUp size={16} className="mr-0.5" />
                        ) : (
                          <TrendingDown size={16} className="mr-0.5" />
                        )}
                        {formatDelta(summary.changes.totalScans)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">Vs. previous period</p>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl p-6 bg-card border border-border shadow-sm group hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                        Unique Users
                      </p>
                      <Users size={20} className="text-primary/50 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-foreground text-4xl font-extrabold tracking-tight">
                        {formatNumber(summary.uniqueUsers)}
                      </p>
                      <span
                        className={`flex items-center text-sm font-bold px-1.5 py-0.5 rounded ${
                          summary.changes.uniqueUsers >= 0
                            ? 'text-success bg-success/10'
                            : 'text-destructive bg-red-500/10'
                        }`}
                      >
                        {summary.changes.uniqueUsers >= 0 ? (
                          <TrendingUp size={16} className="mr-0.5" />
                        ) : (
                          <TrendingDown size={16} className="mr-0.5" />
                        )}
                        {formatDelta(summary.changes.uniqueUsers)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      ~{summary.scansPerUser} scans per user
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl p-6 bg-card border border-border shadow-sm group hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                        Conversion Rate
                      </p>
                      <ShoppingCart size={20} className="text-primary/50 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-foreground text-4xl font-extrabold tracking-tight">
                        {summary.conversionRate}%
                      </p>
                      <span
                        className={`flex items-center text-sm font-bold px-1.5 py-0.5 rounded ${
                          summary.changes.conversionRate >= 0
                            ? 'text-success bg-success/10'
                            : 'text-destructive bg-red-500/10'
                        }`}
                      >
                        {summary.changes.conversionRate >= 0 ? (
                          <TrendingUp size={16} className="mr-0.5" />
                        ) : (
                          <TrendingDown size={16} className="mr-0.5" />
                        )}
                        {summary.changes.conversionRate > 0 ? '+' : ''}
                        {summary.changes.conversionRate}%
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      {formatNumber(summary.totalScans)} scans / {formatNumber(summary.impressions)} impressions
                    </p>
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-100">
                  <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6 flex flex-col shadow-sm min-h-80">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-foreground text-lg font-bold">Scan Volume</h3>
                        <p className="text-muted-foreground text-sm">
                          Traffic over the selected period
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 w-full min-h-64">
                      {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No scans in this period yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="4 4" stroke={chartColors.border} />
                            <XAxis dataKey="label" tick={{ fill: chartColors.muted, fontSize: 12 }} />
                            <YAxis tick={{ fill: chartColors.muted, fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: chartColors.card,
                                border: `1px solid ${chartColors.border}`,
                                borderRadius: '8px',
                                color: chartColors.foreground,
                              }}
                              labelStyle={{ color: chartColors.muted }}
                            />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke={chartColors.chart4}
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, fill: chartColors.foreground }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border-r border-border px-2 py-6 flex flex-col shadow-sm rounded-md">
                    <div className="mb-6 px-4">
                      <h3 className="text-foreground text-lg font-bold">Top Districts</h3>
                      <p className="text-muted-foreground text-sm">Scan density by location</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-5 px-4">
                      {(analytics?.topLocations || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No location data yet</p>
                      ) : (
                        analytics?.topLocations.map((loc) => (
                          <div key={loc.name} className="group">
                            <div className="flex justify-between mb-2 text-sm">
                              <span className="font-medium text-muted-foreground">{loc.name}</span>
                              <span className="font-bold text-primary">{formatNumber(loc.count)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${Math.max(loc.percent, 4)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-xl bg-card border border-border overflow-hidden min-h-64">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-foreground font-bold">Scan Locations</h3>
                    <p className="text-sm text-muted-foreground">Geographic distribution of QR scans</p>
                  </div>
                  <div ref={mapContainer} className="h-64 w-full" />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl p-5 bg-card border-r border-border shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium uppercase mb-1">
                        Top Device OS
                      </p>
                      <h4 className="text-2xl font-bold text-foreground">
                        {topDevice ? topDevice.os : '—'}
                      </h4>
                      <p className="text-primary text-sm font-medium mt-1">
                        {topDevice ? `${topDevice.percent}% of total scans` : 'No device data yet'}
                      </p>
                    </div>
                    <Smartphone size={48} className="text-muted-foreground" />
                  </div>

                  <div className="rounded-xl p-5 bg-card border border-border shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium uppercase mb-1">
                        Peak Hour
                      </p>
                      <h4 className="text-2xl font-bold text-foreground">{peakHour?.label || '—'}</h4>
                      <p className="text-muted-foreground text-sm font-medium mt-1">
                        {peakHour?.count
                          ? `${formatNumber(peakHour.count)} scans at peak`
                          : 'No scan data yet'}
                      </p>
                    </div>
                    <BarChart3 size={48} className="text-primary" />
                  </div>
                </section>
              </>
            )}
          </main>

          <aside className="flex h-80 w-full shrink-0 flex-col border-t border-border bg-card md:h-auto md:w-80 md:border-l md:border-t-0 lg:w-96">
            <div className="flex items-center justify-between border-b border-border bg-card p-5">
              <h3 className="font-bold text-foreground">Recent Activity</h3>
              <div className="flex items-center gap-1.5">
                <span className="block size-2 animate-pulse rounded-full bg-success" />
                <span className="font-mono text-xs text-muted-foreground">LIVE</span>
              </div>
            </div>
            <div className="relative flex-1 overflow-y-auto p-0 no-scrollbar">
              <div className="flex flex-col">
                {(analytics?.recentScans || []).length === 0 ? (
                  <p className="p-5 text-sm text-muted-foreground">No scans recorded yet</p>
                ) : (
                  analytics?.recentScans.map((item, idx) => (
                    <div
                      key={`${item.createdAt}-${idx}`}
                      className="group relative border-b border-border px-5 py-4 transition-colors hover:bg-accent"
                    >
                      <div className="absolute bottom-0 left-0 top-0 w-0.75 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-secondary p-2 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          {item.device.toLowerCase().includes('ipad') ||
                          item.device.toLowerCase().includes('tablet') ? (
                            <Monitor size={18} />
                          ) : (
                            <Smartphone size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {item.device}
                            </p>
                            <span className="shrink-0 font-mono text-xs text-muted-foreground">
                              {item.timeAgo}
                            </span>
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={14} />
                            {item.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-card to-transparent" />
            </div>
            <div className="border-t border-border p-4 text-center">
              <button
                type="button"
                onClick={fetchAnalytics}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent hover:text-foreground"
              >
                Refresh
                <Activity size={16} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
