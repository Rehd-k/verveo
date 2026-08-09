import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { User } from '@/models/User';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { advanceCampaignStatus } from '@/lib/fulfillment/advanceStatus';
import { findMatchingRetailers } from '@/lib/fulfillment/retailers';

const patchCampaignSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z
    .enum(['draft', 'processing', 'printing', 'dispatched', 'live', 'completed'])
    .optional(),
  statusNote: z.string().max(2000).optional().nullable(),
  expectedAt: z.string().optional().nullable(),
  trackingRef: z.string().max(200).optional().nullable(),
  notify: z.boolean().optional(),
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
    const matchingRetailers = await findMatchingRetailers({
      locations: campaign.locations || [],
      venueTypes: campaign.venueTypes || [],
      includePending: true,
    });

    return NextResponse.json({
      ...campaign,
      id: campaign._id.toString(),
      owner: owner
        ? { id: owner._id.toString(), email: owner.email, name: owner.name }
        : undefined,
      matchingRetailers,
      printJob: {
        title: campaign.title,
        productType: campaign.productType,
        quantity: campaign.quantity,
        locations: campaign.locations,
        venueTypes: campaign.venueTypes,
        designImageUrl: campaign.design?.imageUrl || campaign.design?.previewUrl,
        designText: campaign.design?.text,
        designColors: campaign.design?.colors,
        handoff: campaign.design?.handoff,
        qrCode: campaign.qrCode,
        ctaUrl: campaign.ctaUrl,
        budget: campaign.budget,
        advertiser: owner ? { name: owner.name, email: owner.email } : null,
      },
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

    const data = parsed.data;
    const statusChanging =
      data.status !== undefined ||
      data.statusNote !== undefined ||
      data.expectedAt !== undefined ||
      data.trackingRef !== undefined;

    if (statusChanging && data.status) {
      const campaign = await advanceCampaignStatus({
        campaignId: id,
        status: data.status,
        note: data.statusNote === null ? '' : data.statusNote,
        expectedAt: data.expectedAt === null ? null : data.expectedAt,
        trackingRef: data.trackingRef === null ? '' : data.trackingRef,
        changedBy: auth.id,
        notify: data.notify,
      });

      const other: Record<string, unknown> = {};
      if (data.title !== undefined) other.title = data.title;
      if (data.description !== undefined) other.description = data.description;
      if (data.budget !== undefined) other.budget = data.budget;
      if (data.quantity !== undefined) other.quantity = data.quantity;
      if (data.ctaUrl !== undefined) other.ctaUrl = data.ctaUrl;
      if (data.stats !== undefined) other.stats = data.stats;

      if (Object.keys(other).length > 0) {
        await Campaign.findByIdAndUpdate(id, other);
      }

      const refreshed = await Campaign.findById(id);
      return NextResponse.json(refreshed);
    }

    // Non-status field updates (or note/date without status change)
    if (
      data.statusNote !== undefined ||
      data.expectedAt !== undefined ||
      data.trackingRef !== undefined
    ) {
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
      if (data.statusNote !== undefined) {
        campaign.statusNote = data.statusNote === null ? undefined : data.statusNote;
      }
      if (data.expectedAt !== undefined) {
        campaign.expectedAt =
          data.expectedAt === null || data.expectedAt === ''
            ? undefined
            : new Date(data.expectedAt);
      }
      if (data.trackingRef !== undefined) {
        campaign.trackingRef =
          data.trackingRef === null || data.trackingRef === ''
            ? undefined
            : data.trackingRef;
      }
      await campaign.save();
    }

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.budget !== undefined) update.budget = data.budget;
    if (data.quantity !== undefined) update.quantity = data.quantity;
    if (data.ctaUrl !== undefined) update.ctaUrl = data.ctaUrl;
    if (data.stats !== undefined) update.stats = data.stats;

    const campaign =
      Object.keys(update).length > 0
        ? await Campaign.findByIdAndUpdate(id, update, { new: true })
        : await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Admin patch campaign error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
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
