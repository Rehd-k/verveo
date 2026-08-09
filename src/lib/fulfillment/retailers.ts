import { Retailer } from '@/models/Retailer';
import { matchesLocation, matchesVenueType } from '@/lib/matchRetailerCampaign';

export type MatchingRetailer = {
  id: string;
  businessName: string;
  city: string;
  venueType: string;
  status: string;
  address?: string;
  currentStock: number;
  allowance: number;
};

/**
 * Find retailers that could fulfill a campaign's cities / venue types.
 * Uses the same matching rules as the retailer campaign portal.
 */
export async function findMatchingRetailers(params: {
  locations: string[];
  venueTypes: string[];
  includePending?: boolean;
}): Promise<MatchingRetailer[]> {
  const statuses = params.includePending ? ['active', 'pending'] : ['active'];
  const retailers = await Retailer.find({ status: { $in: statuses } })
    .sort({ city: 1, businessName: 1 })
    .lean();

  const locations = params.locations || [];
  const venueTypes = params.venueTypes || [];

  const matched = retailers.filter(
    (r) =>
      matchesLocation(locations, r.city || '') &&
      matchesVenueType(venueTypes, r.venueType || '')
  );

  return matched.map((r) => ({
    id: r._id.toString(),
    businessName: r.businessName,
    city: r.city,
    venueType: r.venueType,
    status: r.status,
    address: r.address,
    currentStock: r.currentStock ?? 0,
    allowance: r.allowance ?? 0,
  }));
}
