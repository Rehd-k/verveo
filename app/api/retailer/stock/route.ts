import { NextRequest, NextResponse } from 'next/server';
import { getRetailerProfile, isAuthUser, requireRetailer } from '@/lib/apiAuth';
import { StockOrder } from '@/models/StockOrder';

export async function GET(request: NextRequest) {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  const retailer = await getRetailerProfile(auth.id);
  if (!retailer) {
    return NextResponse.json({ error: 'Retailer profile not found' }, { status: 404 });
  }

  const orders = await StockOrder.find({ retailerId: retailer._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return NextResponse.json({
    stock: {
      allowance: retailer.allowance,
      currentStock: retailer.currentStock,
      usedStock: Math.max(0, retailer.allowance - retailer.currentStock),
    },
    orders: orders.map((order) => ({
      id: order._id.toString(),
      quantity: order.quantity,
      status: order.status,
      notes: order.notes,
      fulfilledAt: order.fulfilledAt,
      createdAt: order.createdAt,
    })),
  });
}
