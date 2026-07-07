import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { User } from '@/models/User';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

const patchCampaignSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z
    .enum(['draft', 'processing', 'printing', 'dispatched', 'live', 'completed'])
    .optional(),
  budget: z.number().optional(),
  quantity: z.number().optional(),
  ctaUrl: z.string().optional(),
  stats: z
    .object({
      scans: z.number().optional(),
      impressions: z.number().optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { id } = await params;
    await dbConnect();

    const campaign = await Campaign.findById(id).lean();
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const owner = await User.findById(campaign.userId).select('email name').lean();

    return NextResponse.json({
      ...campaign,
      id: campaign._id.toString(),
      owner: owner
        ? { id: owner._id.toString(), email: owner.email, name: owner.name }
        : undefined,
    });
  } catch (error) {
    console.error('Admin get campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { id } = await params;
    await dbConnect();

    const body = await request.json();
    const parsed = patchCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const campaign = await Campaign.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Admin patch campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { id } = await params;
    await dbConnect();

    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
