import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { isAuthUser, requireAdmin } from '@/lib/apiAuth';
import { StockOrder } from '@/models/StockOrder';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      StockOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('retailerId', 'businessName city venueType')
        .lean(),
      StockOrder.countDocuments(filter),
    ]);

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order._id.toString(),
        retailerId: (order.retailerId as { _id?: { toString(): string } })?._id?.toString()
          || order.retailerId?.toString(),
        quantity: order.quantity,
        status: order.status,
        notes: order.notes,
        fulfilledAt: order.fulfilledAt,
        createdAt: order.createdAt,
        retailer: order.retailerId
          ? {
              id: (order.retailerId as { _id: { toString(): string } })._id.toString(),
              businessName: (order.retailerId as { businessName?: string }).businessName,
              city: (order.retailerId as { city?: string }).city,
              venueType: (order.retailerId as { venueType?: string }).venueType,
            }
          : null,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin list stock orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
