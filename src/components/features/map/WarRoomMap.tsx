'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NIGERIA_CENTER } from '@/hooks/useMapUserLocation';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function WarRoomMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || map.current || !mapContainer.current) return;

    const isDark = resolvedTheme !== 'light';
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
      center: [NIGERIA_CENTER.longitude, NIGERIA_CENTER.latitude],
      zoom: NIGERIA_CENTER.zoom,
      pitch: 45,
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mounted, resolvedTheme]);

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 h-full w-full min-h-60 overflow-hidden rounded-xl"
      aria-label="Campaign map"
    />
  );
}
