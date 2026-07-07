import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { Scan } from '@/models/Scan';
import { parseLocation, enrichLocation, getDevScanLocation } from '@/lib/geo';
import {
  appendUtmParams,
  createVisitorId,
  parseClientIp,
  parseDevice,
} from '@/lib/tracking';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    const language = request.headers.get('accept-language')?.split(',')[0]?.trim() || '';

    const ip = parseClientIp(forwarded, realIp);
    const device = parseDevice(userAgent);
    let location = await parseLocation(ip);
    if (!location.city && !location.region && !location.country) {
      const devOverride = getDevScanLocation();
      if (devOverride) {
        location = { ...location, ...devOverride };
      }
    }
    location = await enrichLocation(location);
    const visitorId = createVisitorId(ip, userAgent);

    campaign.stats = campaign.stats || { scans: 0, impressions: 0 };
    campaign.stats.scans = (campaign.stats.scans || 0) + 1;
    await campaign.save();

    await Scan.create({
      campaignId: campaign._id,
      ip,
      userAgent,
      visitorId,
      device,
      location,
      lat: location.lat,
      lng: location.lng,
      referrer,
      language,
    });

    if (campaign.ctaUrl) {
      const redirectUrl = appendUtmParams(campaign.ctaUrl, String(campaign._id));
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR redirect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
