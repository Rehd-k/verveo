import type { ParsedLocation } from '@/lib/tracking';

function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice(7);
  }
  return trimmed;
}

function isPrivateIp(rawIp: string): boolean {
  const ip = normalizeIp(rawIp);
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true;
  }

  if (ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return true;
  }

  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && parts.every((p) => !Number.isNaN(p))) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
      return true;
    }
  }

  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
    return true;
  }

  return false;
}

interface IpApiCoResponse {
  error?: boolean;
  reason?: string;
  city?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
}

export function getDevScanLocation(): ParsedLocation | null {
  if (process.env.NODE_ENV === 'production') return null;

  const city = process.env.DEV_SCAN_LOCATION_CITY;
  const region = process.env.DEV_SCAN_LOCATION_REGION;
  const country = process.env.DEV_SCAN_LOCATION_COUNTRY;

  if (!city && !region && !country) return null;

  return {
    city: city || undefined,
    region: region || undefined,
    country: country || undefined,
    lat: process.env.DEV_SCAN_LOCATION_LAT
      ? Number(process.env.DEV_SCAN_LOCATION_LAT)
      : undefined,
    lng: process.env.DEV_SCAN_LOCATION_LNG
      ? Number(process.env.DEV_SCAN_LOCATION_LNG)
      : undefined,
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<ParsedLocation> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return { lat, lng };

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,locality,region,country&limit=1&access_token=${token}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { lat, lng };

    const data = (await res.json()) as {
      features?: Array<{
        place_type?: string[];
        text?: string;
        context?: Array<{ id?: string; text?: string }>;
      }>;
    };

    const feature = data.features?.[0];
    if (!feature) return { lat, lng };

    let city: string | undefined;
    let region: string | undefined;
    let country: string | undefined;

    if (feature.place_type?.includes('place') || feature.place_type?.includes('locality')) {
      city = feature.text;
    }

    for (const ctx of feature.context ?? []) {
      if (ctx.id?.startsWith('region.')) region = ctx.text;
      if (ctx.id?.startsWith('country.')) country = ctx.text;
    }

    if (!city && feature.text) {
      city = feature.text;
    }

    return { lat, lng, city, region, country };
  } catch {
    return { lat, lng };
  }
}

export async function parseLocation(ip: string): Promise<ParsedLocation> {
  if (isPrivateIp(ip)) {
    return getDevScanLocation() ?? {};
  }

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      cache: 'no-store',
    });

    if (!res.ok) return {};

    const data = (await res.json()) as IpApiCoResponse;
    if (data.error) return {};

    const location: ParsedLocation = {
      lat: data.latitude,
      lng: data.longitude,
      city: data.city || undefined,
      region: data.region || undefined,
      country: data.country_name || undefined,
    };

    if (location.lat != null && location.lng != null && !location.city) {
      const enriched = await reverseGeocode(location.lat, location.lng);
      return { ...location, ...enriched };
    }

    return location;
  } catch {
    return {};
  }
}

export async function enrichLocation(location: ParsedLocation): Promise<ParsedLocation> {
  if (location.lat != null && location.lng != null && !location.city) {
    const enriched = await reverseGeocode(location.lat, location.lng);
    return { ...location, ...enriched };
  }
  return location;
}
