import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { getCampaignAnalytics, type AnalyticsRange } from '@/lib/analytics';
import { requireOwnerOrAdmin, isAuthUser } from '@/lib/apiAuth';

const VALID_RANGES: AnalyticsRange[] = ['24h', '7d', '30d'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '24h';
    const range = VALID_RANGES.includes(rangeParam as AnalyticsRange)
      ? (rangeParam as AnalyticsRange)
      : '24h';

    await dbConnect();

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const auth = await requireOwnerOrAdmin(request, campaign.userId.toString());
    if (!isAuthUser(auth)) return auth;

    const analytics = await getCampaignAnalytics(id, campaign.quantity || 0, range);

    return NextResponse.json({
      campaign: {
        id: campaign._id,
        title: campaign.title,
        quantity: campaign.quantity,
      },
      range,
      ...analytics,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
