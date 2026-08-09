import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { User } from '@/models/User';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { isFulfillmentQueueStatus } from '@/lib/fulfillment/constants';

/** Ops queue: campaigns awaiting print / dispatch work */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {
      status: { $in: ['processing', 'printing', 'dispatched'] },
    };
    if (status && isFulfillmentQueueStatus(status)) {
      filter.status = status;
    }

    const campaigns = await Campaign.find(filter).sort({ updatedAt: 1 }).limit(100).lean();

    const ownerIds = [...new Set(campaigns.map((c) => c.userId.toString()))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select('email name').lean();
    const ownerMap = new Map(owners.map((o) => [o._id.toString(), o]));

    const counts = await Campaign.aggregate([
      { $match: { status: { $in: ['processing', 'printing', 'dispatched', 'live'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    for (const row of counts) countMap[row._id] = row.count;

    return NextResponse.json({
      counts: {
        processing: countMap.processing || 0,
        printing: countMap.printing || 0,
        dispatched: countMap.dispatched || 0,
        live: countMap.live || 0,
      },
      campaigns: campaigns.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        status: c.status,
        productType: c.productType,
        quantity: c.quantity,
        locations: c.locations,
        venueTypes: c.venueTypes,
        budget: c.budget,
        statusNote: c.statusNote,
        expectedAt: c.expectedAt,
        trackingRef: c.trackingRef,
        designHandoff: c.design?.handoff,
        hasDesign: !!(c.design?.imageUrl || c.design?.previewUrl),
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
        owner: ownerMap.get(c.userId.toString())
          ? {
              id: c.userId.toString(),
              email: ownerMap.get(c.userId.toString())!.email,
              name: ownerMap.get(c.userId.toString())!.name,
            }
          : undefined,
      })),
    });
  } catch (error) {
    console.error('Fulfillment queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
