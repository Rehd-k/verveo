'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NIGERIA_CENTER } from '@/hooks/useMapUserLocation';

// Ensure you have NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function WarRoomMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11', // Matches the dark theme
            center: [NIGERIA_CENTER.longitude, NIGERIA_CENTER.latitude],
            zoom: NIGERIA_CENTER.zoom,
            pitch: 45, // Adds 3D perspective
        });

        map.current.on('load', () => {
            // Add heatmaps or markers here
        });

        return () => map.current?.remove();
    }, []);

    return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}