'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/store/authStore';
import { BarChart3, Users, ShoppingCart, TrendingUp, TrendingDown, Settings, Bell, User, Monitor, Activity, Smartphone, MapPin, LogOut } from 'lucide-react';

if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns?userId=${user?.id || ''}`)
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
    <section className='bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex flex-col overflow-hidden relative'>
    
      <div className="h-18"></div>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">
          {/* Left Panel: Main Dashboard */}
          <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 gap-6 relative no-scrollbar">
            {/* KPI Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* KPI 1 */}
              <div className="flex flex-col gap-1 rounded-xl p-6 bg-card-dark border border-white/5 shadow-sm group hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Total Scans
                  </p>
                  <BarChart3 size={20} className="text-primary/50 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-gray-900 dark:text-white text-4xl font-extrabold tracking-tight">
                    12,450
                  </p>
                  <span className="flex items-center text-green-500 text-sm font-bold bg-green-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp size={16} className="mr-0.5" />
                    12%
                  </span>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Vs. previous 24h period
                </p>
              </div>

              {/* KPI 2 */}
              <div className="flex flex-col gap-1 rounded-xl p-6 bg-card-dark border border-white/5 shadow-sm group hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Unique Users
                  </p>
                  <Users size={20} className="text-primary/50 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-gray-900 dark:text-white text-4xl font-extrabold tracking-tight">
                    8,201
                  </p>
                  <span className="flex items-center text-green-500 text-sm font-bold bg-green-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp size={16} className="mr-0.5" />
                    5%
                  </span>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  ~1.5 scans per user
                </p>
              </div>

              {/* KPI 3 */}
              <div className="flex flex-col gap-1 rounded-xl p-6 bg-card-dark border border-white/5 shadow-sm group hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Conversion Rate
                  </p>
                  <ShoppingCart size={20} className="text-primary/50 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-gray-900 dark:text-white text-4xl font-extrabold tracking-tight">
                    4.5%
                  </p>
                  <span className="flex items-center text-red-500 text-sm font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                    <TrendingDown size={16} className="mr-0.5" />
                    0.2%
                  </span>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Goal: 5.0% by end of week
                </p>
              </div>
            </section>

            {/* Charts Row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-100">
              {/* Main Chart Area */}
              <div className="lg:col-span-2 rounded-xl bg-card-dark border border-white/5 p-6 flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold">
                      Scan Volume
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Real-time traffic over the last 24 hours
                    </p>
                  </div>
                  <select className="bg-gray-100 dark:bg-background-dark text-gray-700 dark:text-gray-300 text-sm border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary cursor-pointer">
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="flex-1 w-full relative group cursor-crosshair">
                  {/* Custom SVG Chart */}
                  <svg
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 800 300"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1={0} x2={0} y1={0} y2={1}>
                        <stop offset="0%" stopColor="#f2d00d" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f2d00d" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1={0} x2={1} y1={0} y2={0}>
                        <stop offset="0%" stopColor="#f2d00d" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#f2d00d" />
                        <stop offset="100%" stopColor="#fff" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line
                      className="text-gray-200 dark:text-gray-800"
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      x1={0}
                      x2={800}
                      y1={0}
                      y2={0}
                    />
                    <line
                      className="text-gray-200 dark:text-gray-800"
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      x1={0}
                      x2={800}
                      y1={75}
                      y2={75}
                    />
                    <line
                      className="text-gray-200 dark:text-gray-800"
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      x1={0}
                      x2={800}
                      y1={150}
                      y2={150}
                    />
                    <line
                      className="text-gray-200 dark:text-gray-800"
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      x1={0}
                      x2={800}
                      y1={225}
                      y2={225}
                    />
                    <line
                      className="text-gray-200 dark:text-gray-800"
                      stroke="currentColor"
                      x1={0}
                      x2={800}
                      y1={300}
                      y2={300}
                    />
                    {/* Area Path */}
                    <path
                      d="M0,220 C50,220 50,150 100,150 C150,150 150,180 200,180 C250,180 250,100 300,100 C350,100 350,140 400,140 C450,140 450,80 500,80 C550,80 550,120 600,120 C650,120 650,40 700,40 C750,40 750,90 800,90 V300 H0 Z"
                      fill="url(#chartGradient)"
                    />
                    {/* Line Path */}
                    <path
                      className="glow-chart-line"
                      d="M0,220 C50,220 50,150 100,150 C150,150 150,180 200,180 C250,180 250,100 300,100 C350,100 350,140 400,140 C450,140 450,80 500,80 C550,80 550,120 600,120 C650,120 650,40 700,40 C750,40 750,90 800,90"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                    />
                    {/* Pulsing Dot at End */}
                    <circle cx={800} cy={90} fill="#fff" r={4} />
                    <circle
                      className="animate-ping opacity-75"
                      cx={800}
                      cy={90}
                      fill="none"
                      r={8}
                      stroke="#f2d00d"
                      strokeWidth={2}
                    />
                  </svg>
                  {/* Tooltip (Simulated Hover) */}
                  <div className="absolute top-[20%] right-[10%] bg-surface-dark border border-primary/30 rounded-lg p-3 shadow-lg backdrop-blur-sm hidden group-hover:block z-10 pointer-events-none transform -translate-y-full">
                    <p className="text-xs text-gray-400 mb-1">14:30 PM</p>
                    <p className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="block w-2 h-2 rounded-full bg-primary" />
                      742 Scans
                    </p>
                  </div>
                </div>
                {/* X Axis Labels */}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-4 font-mono">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                </div>
              </div>

              {/* Location Chart */}
              <div className="bg-card-dark border-r border-white/5 px-2 py-6 flex flex-col shadow-sm rounded-md">
                <div className="mb-6">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold">
                    Top Districts
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Scan density by location
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-5">
                  <div className="group">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium text-gray-300">Lekki Phase 1</span>
                      <span className="font-bold text-primary">3,840</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full relative" style={{ width: "45%" }} >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium text-gray-300">Ikeja City Mall</span>
                      <span className="font-bold text-primary">3,105</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-primary/80 h-2 rounded-full" style={{ width: "38%" }} />
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium text-gray-300">Victoria Island</span>
                      <span className="font-bold text-primary">1,892</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-primary/60 h-2 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium text-gray-300">Maryland</span>
                      <span className="font-bold text-primary">942</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-primary/40 h-2 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium text-gray-300">Surulere</span>
                      <span className="font-bold text-primary">621</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-primary/30 h-2 rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-5 bg-card-dark border-r border-white/5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase mb-1">
                    Top Device OS
                  </p>
                  <h4 className="text-2xl font-bold text-white">iOS (Apple)</h4>
                  <p className="text-primary text-sm font-medium mt-1">62% of total scans</p>
                </div>
                <Smartphone size={48} className="text-gray-400" />
              </div>

              <div className="rounded-xl p-5 bg-card-dark border border-white/5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase mb-1">
                    Peak Hour
                  </p>
                  <h4 className="text-2xl font-bold text-white">18:00 - 19:00</h4>
                  <p className="text-gray-400 text-sm font-medium mt-1">Highest user engagement</p>
                </div>
                <BarChart3 size={48} className="text-primary" />
              </div>
            </section>
          </main>

          {/* Right Panel: Live Activity Feed */}
          <aside className="w-full md:w-96 border-l border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-background-dark flex flex-col h-125 md:h-auto">
            <div className="p-5 border-b border-gray-500 dark:border-border-dark flex justify-between items-center bg-gray-800 dark:bg-surface-dark">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  LIVE
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto relative no-scrollbar p-0">
              <div className="flex flex-col">
                {[
                  { device: 'iPhone 14 Pro', location: 'Lekki Phase 1', time: 'Just now', icon: Smartphone },
                  { device: 'Samsung S23', location: 'Ikeja City Mall', time: '2s ago', icon: Smartphone },
                  { device: 'iPhone 13', location: 'Maryland', time: '15s ago', icon: Smartphone },
                  { device: 'Google Pixel 7', location: 'Victoria Island', time: '32s ago', icon: Smartphone },
                  { device: 'iPhone 12', location: 'Surulere', time: '1m ago', icon: Smartphone },
                  { device: 'iPad Pro', location: 'Yaba', time: '1m ago', icon: Monitor },
                  { device: 'Tecno Spark', location: 'Ikorodu', time: '2m ago', icon: Smartphone },
                ].map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="relative px-5 py-4 border-b border-gray-200 dark:border-border-dark/50 hover:bg-white/5 dark:hover:bg-white/5 transition-colors group">
                      <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-primary group-hover:text-black transition-colors">
                          <IconComponent size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {item.device}
                            </p>
                            <span className="text-xs font-mono text-gray-400">{item.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin size={14} />
                            {item.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none" />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-border-dark text-center">
              <button className="text-sm text-primary hover:text-white transition-colors font-semibold flex items-center justify-center gap-2 w-full py-2 rounded hover:bg-surface-dark">
                View Full History
                <Activity size={16} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
