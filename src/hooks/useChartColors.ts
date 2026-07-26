'use client';

import { useEffect, useState } from 'react';

/** Read CSS custom property colors for Recharts / Mapbox JS APIs */
export function useChartColors() {
  const [colors, setColors] = useState({
    foreground: '#f4f5f7',
    muted: '#9da6b8',
    border: 'rgba(255,255,255,0.1)',
    background: '#0f1115',
    card: '#1c1f26',
    primary: '#195de6',
    chart1: '#3b82f6',
    chart2: '#38bdf8',
    chart3: '#a78bfa',
    chart4: '#f2d00d',
    chart5: '#34d399',
  });

  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const get = (name: string, fallback: string) =>
        s.getPropertyValue(name).trim() || fallback;
      setColors({
        foreground: get('--foreground', '#f4f5f7'),
        muted: get('--muted-foreground', '#9da6b8'),
        border: get('--border', 'rgba(255,255,255,0.1)'),
        background: get('--background', '#0f1115'),
        card: get('--card', '#1c1f26'),
        primary: get('--primary', '#195de6'),
        chart1: get('--chart-1', '#3b82f6'),
        chart2: get('--chart-2', '#38bdf8'),
        chart3: get('--chart-3', '#a78bfa'),
        chart4: get('--chart-4', '#f2d00d'),
        chart5: get('--chart-5', '#34d399'),
      });
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => obs.disconnect();
  }, []);

  return colors;
}
