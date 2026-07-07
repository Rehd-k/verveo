import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { generateCampaignQrCode } from '@/lib/qr';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { id } = await params;
    await dbConnect();

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const qrCode = await generateCampaignQrCode(String(campaign._id));
    campaign.qrCode = qrCode;
    await campaign.save();

    return NextResponse.json({ qrCode, trackingUrl: `/api/qr/${campaign._id}` });
  } catch (error) {
    console.error('Admin QR regeneration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
