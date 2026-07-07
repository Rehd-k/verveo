import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { generateCampaignQrCode } from '@/lib/qr';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';
import { getPlatformSettings } from '@/lib/platformSettings';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let query: Record<string, unknown> = {};
    if (auth.role === 'admin' && all) {
      query = {};
    } else {
      const userId = searchParams.get('userId') || auth.id;
      if (auth.role !== 'admin' && userId !== auth.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query = { userId: auth.role === 'admin' ? userId : auth.id };
    }

    const campaigns = await Campaign.find(query);

    for (const campaign of campaigns) {
      if (campaign.ctaUrl?.trim() && !campaign.qrCode) {
        try {
          campaign.qrCode = await generateCampaignQrCode(String(campaign._id));
          await campaign.save();
        } catch (error) {
          console.error(`Failed to generate QR for campaign ${campaign._id}:`, error);
        }
      }
    }

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();

    const settings = await getPlatformSettings();
    if (settings.maintenanceMode && auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Platform is in maintenance mode' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const campaign = await Campaign.create({
      ...body,
      userId: auth.id,
      status: body.status || 'draft',
      stats: body.stats || { scans: 0, impressions: 0 },
    });

    if (campaign.ctaUrl?.trim()) {
      try {
        campaign.qrCode = await generateCampaignQrCode(String(campaign._id));
        await campaign.save();
      } catch (error) {
        console.error('Failed to generate campaign QR code:', error);
      }
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
