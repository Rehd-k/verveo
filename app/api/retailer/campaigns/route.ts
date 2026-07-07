import { NextRequest, NextResponse } from 'next/server';
import { getMatchedRetailerCampaigns } from '@/lib/retailerCampaigns';
import { getRetailerProfile, isAuthUser, requireRetailer } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  const retailer = await getRetailerProfile(auth.id);
  if (!retailer) {
    return NextResponse.json({ error: 'Retailer profile not found' }, { status: 404 });
  }

  const campaigns = await getMatchedRetailerCampaigns(retailer);

  return NextResponse.json({
    campaigns: campaigns.map((campaign) => ({
      id: campaign._id.toString(),
      title: campaign.title,
      description: campaign.description,
      locations: campaign.locations,
      venueTypes: campaign.venueTypes,
      productType: campaign.productType,
      quantity: campaign.quantity,
      design: campaign.design,
      status: campaign.status,
      stats: campaign.stats,
      createdAt: campaign.createdAt,
    })),
  });
}
