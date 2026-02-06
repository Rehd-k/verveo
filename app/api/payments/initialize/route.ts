import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, campaignId, amount, email, callback_url } = body;

    if (!userId || !campaignId || !amount || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order = await Order.create({ userId, campaignId, amount, status: 'pending' });

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
    }

    const cb = callback_url || `${process.env.NEXTAUTH_URL}/dashboard/checkout/success?orderId=${order._id}`;

    const res = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { amount: Math.round(amount) * 100, email, callback_url: cb, metadata: { orderId: order._id.toString() } },
      { headers: { Authorization: `Bearer ${secret}` } }
    );

    const data = res.data;

    // return Paystack initialization data + order id
    return NextResponse.json({ orderId: order._id, paystack: data });
  } catch (error) {
    console.error('Payment initialize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
