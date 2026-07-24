import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';
import { initializePaystack } from '@/lib/payments/paystack';
import { initializeFlutterwave } from '@/lib/payments/flutterwave';
import type { OnlinePaymentMethod } from '@/lib/payments/types';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();
    const body = await request.json();
    const { campaignId, amount, email, callback_url, paymentMethod = 'paystack' } = body;

    if (!campaignId || !amount || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['paystack', 'flutterwave'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
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
      paymentMethod,
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const cb =
      callback_url ||
      `${baseUrl}/dashboard/checkout/success?orderId=${order._id}&paymentMethod=${paymentMethod}`;

    const initParams = {
      amount,
      email,
      orderId: order._id.toString(),
      callbackUrl: cb,
    };

    const result =
      paymentMethod === 'flutterwave'
        ? await initializeFlutterwave(initParams)
        : await initializePaystack(initParams);

    return NextResponse.json({
      orderId: order._id,
      paymentMethod: paymentMethod as OnlinePaymentMethod,
      redirectUrl: result.redirectUrl,
      reference: result.reference,
    });
  } catch (error) {
    console.error('Payment initialize error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
