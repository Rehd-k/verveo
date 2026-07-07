import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { isAuthUser, requireAdmin } from '@/lib/apiAuth';
import { Retailer } from '@/models/Retailer';
import { StockOrder } from '@/models/StockOrder';

const patchSchema = z.object({
  status: z.enum(['fulfilled', 'cancelled']),
});

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
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const order = await StockOrder.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Stock order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending orders can be updated' }, { status: 400 });
    }

    if (parsed.data.status === 'fulfilled') {
      const retailer = await Retailer.findById(order.retailerId);
      if (!retailer) {
        return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
      }

      retailer.currentStock += order.quantity;
      await retailer.save();

      order.status = 'fulfilled';
      order.fulfilledAt = new Date();
    } else {
      order.status = 'cancelled';
    }

    await order.save();

    return NextResponse.json({
      order: {
        id: order._id.toString(),
        quantity: order.quantity,
        status: order.status,
        notes: order.notes,
        fulfilledAt: order.fulfilledAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin patch stock order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
