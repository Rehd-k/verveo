import { Campaign } from '@/models/Campaign';
import { matchesLocation, matchesVenueType } from '@/lib/matchRetailerCampaign';

const ACTIVE_CAMPAIGN_STATUSES = ['dispatched', 'live'];

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
      matchesVenueType(campaign.venueTypes || [], retailer.venueType || '')
  );
}
