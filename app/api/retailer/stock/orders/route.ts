import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRetailerProfile, isAuthUser, requireActiveRetailer, requireRetailer } from '@/lib/apiAuth';
import { StockOrder } from '@/models/StockOrder';

const orderSchema = z.object({
  quantity: z.number().int().min(1).max(10000),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  const retailer = await getRetailerProfile(auth.id);
  if (!retailer) {
    return NextResponse.json({ error: 'Retailer profile not found' }, { status: 404 });
  }

  const orders = await StockOrder.find({ retailerId: retailer._id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
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

export async function POST(request: NextRequest) {
  const result = await requireActiveRetailer(request, { write: true });
  if (result instanceof NextResponse) return result;

  const { retailer } = result;

  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const order = await StockOrder.create({
    ...parsed.data,
    retailerId: retailer._id,
  });

  return NextResponse.json(
    {
      order: {
        id: order._id.toString(),
        quantity: order.quantity,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt,
      },
    },
    { status: 201 }
  );
}
