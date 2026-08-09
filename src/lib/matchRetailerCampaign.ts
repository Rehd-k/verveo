/** Shared city / venue matching for retailer ↔ campaign pairing */

export function normalizeMatchValue(value?: string) {
  return (value || '').toLowerCase().trim();
}

/** True if any campaign location string contains the retailer city (or vice versa). */
export function matchesLocation(locations: string[] = [], city: string) {
  const targetCity = normalizeMatchValue(city);
  if (!targetCity) return false;
  return locations.some((location) => {
    const loc = normalizeMatchValue(location);
    return loc.includes(targetCity) || targetCity.includes(loc);
  });
}

/** Exact venue type match after normalize. Empty campaign venueTypes = any venue. */
export function matchesVenueType(venueTypes: string[] = [], venueType: string) {
  if (venueTypes.length === 0) return true;
  const targetVenue = normalizeMatchValue(venueType);
  return venueTypes.some((type) => normalizeMatchValue(type) === targetVenue);
}
