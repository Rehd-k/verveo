'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((data) => {
        setCampaigns(data || []);
        if (data && data.length > 0) setSelected(data[0].id || data[0]._id);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/analytics/campaign/${selected}`)
      .then((r) => r.json())
      .then((data) => {
        const rows = data?.data || [];
        const transformed = rows.map((r: any) => {
          const { year, month, day, hour } = r._id;
          const d = new Date(year, month - 1, day, hour);
          return { time: d.toISOString(), count: r.count };
        });
        setSeries(transformed);
      })
      .catch((e) => console.error(e));
  }, [selected]);

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [3.3792, 6.5244],
        zoom: 9,
      });

      map.current.on('load', () => {
        // Add a small source for campaign centers
        map.current?.addSource('campaigns', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: campaigns
              .filter((c) => c.locations && c.locations.length)
              .map((c) => ({
                type: 'Feature',
                properties: { id: c.id || c._id, scans: c.stats?.scans || 0, title: c.title },
                geometry: { type: 'Point', coordinates: [c.lng || 3.3792, c.lat || 6.5244] },
              })),
          },
        });

        map.current?.addLayer({
          id: 'campaign-circles',
          type: 'circle',
          source: 'campaigns',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'scans'], 0, 6, 100, 30],
            'circle-color': '#FF7A59',
            'circle-opacity': 0.7,
          },
        });
      });
    } catch (err) {
      console.error('Map load error', err);
    }

    return () => {
      if (map.current) map.current.remove();
    };
  }, [campaigns]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <div>
          <select value={selected || ''} onChange={(e) => setSelected(e.target.value)} className="rounded bg-white/5 px-3 py-2 text-white">
            {campaigns.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="rounded-lg p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">Scans (last 48h)</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <XAxis dataKey="time" tickFormatter={(t) => new Date(t).getHours() + ':00'} />
                <YAxis />
                <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
                <Line type="monotone" dataKey="count" stroke="#FF7A59" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">Campaign Heatmap</h3>
          {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
            <div ref={mapContainer} className="h-60 rounded" />
          ) : (
            <div className="h-60 flex items-center justify-center text-white/60">Map not configured</div>
          )}
        </div>
      </div>
    </div>
  );
}
