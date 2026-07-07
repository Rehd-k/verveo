import { booleanPointInPolygon, circle, point } from '@turf/turf';

export interface LocationVenue {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
  subtitle: string[];
  area: string;
  footTraffic: number;
}

export const VENUE_CATEGORIES = [
  'fast food chains',
  'corporate canteens',
  'universities',
  'shopping malls',
  'entertainment venues',
] as const;

export type VenueCategory = (typeof VENUE_CATEGORIES)[number];

/** Maps UI checkbox values to subtitle tags found in venue data */
export const VENUE_CATEGORY_ALIASES: Record<VenueCategory, string[]> = {
  'fast food chains': ['fast food chain', 'fast food chains'],
  'corporate canteens': ['corporate canteens'],
  universities: ['university areas', 'universities'],
  'shopping malls': ['shopping malls', 'Shopping Malls'],
  'entertainment venues': ['entertainment venues', 'Entertainment Venues'],
};

function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim();
}

export function venueMatchesCategory(venue: LocationVenue, category: VenueCategory): boolean {
  const aliases = VENUE_CATEGORY_ALIASES[category].map(normalizeTag);
  return venue.subtitle.some((tag) => aliases.includes(normalizeTag(tag)));
}

export function filterVenuesByCategories(
  venues: LocationVenue[],
  categories: string[]
): LocationVenue[] {
  if (categories.length === 0) return [];
  return venues.filter((venue) =>
    categories.some((cat) =>
      VENUE_CATEGORIES.includes(cat as VenueCategory) &&
      venueMatchesCategory(venue, cat as VenueCategory)
    )
  );
}

export function filterVenuesByRadius(
  venues: LocationVenue[],
  center: [number, number],
  radiusMeters: number
): LocationVenue[] {
  const circlePoly = circle(center, radiusMeters / 1000, {
    units: 'kilometers',
    steps: 64,
  });

  return venues.filter((venue) => {
    const pt = point([venue.longitude, venue.latitude]);
    return booleanPointInPolygon(pt, circlePoly);
  });
}

export function calculateReach(venues: LocationVenue[]) {
  const dailyReach = venues.reduce((sum, v) => sum + v.footTraffic, 0);
  const districtNames = [...new Set(venues.map((v) => v.area))];
  return {
    dailyReach,
    venueCount: venues.length,
    districtNames,
    selectedPlaces: venues,
  };
}

export function computeTargetedVenues(
  venues: LocationVenue[],
  center: [number, number],
  radiusMeters: number,
  categories: string[]
) {
  const inRadius = filterVenuesByRadius(venues, center, radiusMeters);
  const filtered = filterVenuesByCategories(inRadius, categories);
  return calculateReach(filtered);
}
