'use client';

import { useEffect, useState } from 'react';

export const NIGERIA_CENTER = {
  longitude: 8.6753,
  latitude: 9.082,
  zoom: 5.5,
} as const;

export const DEFAULT_USER_ZOOM = 12;

export interface MapUserLocation {
  longitude: number;
  latitude: number;
  zoom: number;
  ready: boolean;
  fromGeolocation: boolean;
  error: string | null;
}

export function useMapUserLocation(): MapUserLocation {
  const [location, setLocation] = useState<MapUserLocation>({
    longitude: NIGERIA_CENTER.longitude,
    latitude: NIGERIA_CENTER.latitude,
    zoom: NIGERIA_CENTER.zoom,
    ready: false,
    fromGeolocation: false,
    error: null,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocation({
        longitude: NIGERIA_CENTER.longitude,
        latitude: NIGERIA_CENTER.latitude,
        zoom: NIGERIA_CENTER.zoom,
        ready: true,
        fromGeolocation: false,
        error: 'Geolocation not supported',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: DEFAULT_USER_ZOOM,
          ready: true,
          fromGeolocation: true,
          error: null,
        });
      },
      (err) => {
        setLocation({
          longitude: NIGERIA_CENTER.longitude,
          latitude: NIGERIA_CENTER.latitude,
          zoom: NIGERIA_CENTER.zoom,
          ready: true,
          fromGeolocation: false,
          error: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return location;
}
