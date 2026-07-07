import { Campaign } from '@/models/Campaign';

const ACTIVE_CAMPAIGN_STATUSES = ['dispatched', 'live'];

function normalize(value?: string) {
  return (value || '').toLowerCase().trim();
}

function matchesLocation(locations: string[] = [], city: string) {
  const targetCity = normalize(city);
  return locations.some((location) => normalize(location).includes(targetCity));
}

function matchesVenueType(venueTypes: string[] = [], venueType: string) {
  const targetVenue = normalize(venueType);
  return venueTypes.some((type) => normalize(type) === targetVenue);
}

export async function getMatchedRetailerCampaigns(retailer: {
  city?: string;
  venueType?: string;
}) {
  const campaigns = await Campaign.find({
    status: { $in: ACTIVE_CAMPAIGN_STATUSES },
  })
    .sort({ createdAt: -1 })
    .lean();

  return campaigns.filter(
    (campaign) =>
      matchesLocation(campaign.locations, retailer.city || '') &&
      matchesVenueType(campaign.venueTypes, retailer.venueType || '')
  );
}
