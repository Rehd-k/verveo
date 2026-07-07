import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();
    const { reference, orderId } = await request.json();

    if (!reference || !orderId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId.toString() !== auth.id && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
    }

    const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });

    const { data } = res;
    if (data.status && data.data && data.data.status === 'success') {
      await Order.findByIdAndUpdate(orderId, { status: 'paid', transactionId: reference });

      if (order) {
        await Campaign.findByIdAndUpdate(order.campaignId, { status: 'processing' });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, data });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
