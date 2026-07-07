import type { LocationVenue } from '@/lib/locationTargeting';
import { areas as lagosAreas } from '../../app/(protected)/campaign/area';

const VENUE_SUFFIXES = [
  'Shopping Mall',
  'Food Court',
  'University Campus',
  'Corporate Hub',
  'Entertainment Center',
  'Fast Food Plaza',
  'Market Square',
  'Transit Hub',
] as const;

const DEFAULT_SUBTITLE = [
  'fast food chain',
  'corporate canteens',
  'university areas',
  'Shopping Malls',
  'Entertainment Venues',
] as const;

export interface City {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
  backgroundImage?: string;
  subtitle?: string;
  dailyActive?: number;
  inventory?: string;
  screens?: number;
  ExtPopulation?: number;
  density?: string;
  possible_points?: number;
}

function hashSeed(id: string, index: number): number {
  let h = 0;
  const s = `${id}-${index}`;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function offsetCoordinate(base: number, seed: number, scale: number): number {
  const normalized = (seed % 1000) / 1000 - 0.5;
  return base + normalized * scale;
}

function estimateFootTraffic(city: City, venueIndex: number, venueCount: number): number {
  const base = city.dailyActive ?? city.ExtPopulation ?? 3000;
  const share = Math.max(1, Math.floor(base / venueCount / 50));
  const jitter = (hashSeed(city.id, venueIndex) % 500) + 500;
  return Math.min(share + jitter, 15000);
}

export function buildVenuesFromCities(cityList: City[]): LocationVenue[] {
  const venues: LocationVenue[] = [];

  for (const city of cityList) {
    const count = Math.min(city.possible_points ?? city.screens ?? 3, 8);
    for (let i = 0; i < count; i++) {
      const seed = hashSeed(city.id, i);
      const suffix = VENUE_SUFFIXES[i % VENUE_SUFFIXES.length];
      venues.push({
        id: `${city.id}_v${i}`,
        name: `${suffix} - ${city.name}`,
        longitude: offsetCoordinate(city.longitude, seed, 0.04),
        latitude: offsetCoordinate(city.latitude, seed + 1, 0.04),
        address: `${suffix}, ${city.address}`,
        subtitle: [...DEFAULT_SUBTITLE],
        area: city.name,
        footTraffic: estimateFootTraffic(city, i, count),
      });
    }
  }

  return venues;
}

function distanceKm(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Lagos hand-curated venues plus generated nationwide points (deduped within 200m). */
export function getAllNigeriaVenues(cityList: City[]): LocationVenue[] {
  const generated = buildVenuesFromCities(cityList);
  const lagos = lagosAreas as LocationVenue[];
  const merged = [...lagos];

  for (const venue of generated) {
    const tooClose = merged.some(
      (existing) =>
        distanceKm(existing.longitude, existing.latitude, venue.longitude, venue.latitude) < 0.2
    );
    if (!tooClose) {
      merged.push(venue);
    }
  }

  return merged;
}
