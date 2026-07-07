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
    const body = await request.json();
    const { campaignId, amount, email, callback_url } = body;

    if (!campaignId || !amount || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.userId.toString() !== auth.id && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const order = await Order.create({
      userId: auth.id,
      campaignId,
      amount,
      status: 'pending',
    });

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

    return NextResponse.json({ orderId: order._id, paystack: data });
  } catch (error) {
    console.error('Payment initialize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
