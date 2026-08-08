import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

const patchOrderSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed']).optional(),
  transactionId: z.string().optional(),
  paymentMethod: z.enum(['paystack', 'flutterwave', 'bank_transfer', 'wallet']).optional(),
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
    const parsed = patchOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (parsed.data.status === 'paid') {
      await Campaign.findByIdAndUpdate(order.campaignId, { status: 'processing' });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Admin patch order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
