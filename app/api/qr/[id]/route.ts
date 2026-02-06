import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { Scan } from '@/models/Scan';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // increment basic stats
    campaign.stats = campaign.stats || { scans: 0, impressions: 0 };
    campaign.stats.scans = (campaign.stats.scans || 0) + 1;
    await campaign.save();

    // record scan
    const forwarded = request.headers.get('x-forwarded-for') || '';
    const ua = request.headers.get('user-agent') || '';

    await Scan.create({
      campaignId: campaign._id,
      ip: forwarded,
      userAgent: ua,
    });

    // redirect to CTA URL
    if (campaign.ctaUrl) {
      return NextResponse.redirect(campaign.ctaUrl);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR redirect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
