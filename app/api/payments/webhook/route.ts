import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });

    const signature = request.headers.get('x-paystack-signature') || '';
    const text = await request.text();

    const computed = crypto.createHmac('sha512', secret).update(text).digest('hex');
    if (computed !== signature) {
      console.warn('Webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body = JSON.parse(text);
    const event = body.event;

    if (event === 'charge.success' && body.data) {
      const data = body.data;
      const orderId = data.metadata?.orderId;
      const reference = data.reference;

      if (orderId) {
        await dbConnect();
        await Order.findByIdAndUpdate(orderId, { status: 'paid', transactionId: reference });
        const order = await Order.findById(orderId);
        if (order) {
          await Campaign.findByIdAndUpdate(order.campaignId, { status: 'processing' });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}