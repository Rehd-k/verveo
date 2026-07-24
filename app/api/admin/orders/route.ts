import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('campaignId', 'title status')
        .populate('userId', 'email name')
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o._id.toString(),
        campaignId: (o.campaignId as { _id?: { toString(): string } })?._id?.toString() || '',
        userId: (o.userId as { _id?: { toString(): string } })?._id?.toString() || '',
        amount: o.amount,
        status: o.status,
        paymentMethod: o.paymentMethod,
        transactionId: o.transactionId,
        proofImageUrl: o.proofImageUrl,
        proofNote: o.proofNote,
        proofSubmittedAt: o.proofSubmittedAt,
        createdAt: o.createdAt,
        campaign: o.campaignId,
        user: o.userId,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin orders list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
