import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletDeposit } from '@/models/WalletDeposit';
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
    const { amount, email, callback_url, paymentMethod = 'paystack' } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (parsedAmount < 100) {
      return NextResponse.json({ error: 'Minimum deposit is ₦100' }, { status: 400 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    if (!['paystack', 'flutterwave'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    const deposit = await WalletDeposit.create({
      userId: auth.id,
      amount: parsedAmount,
      status: 'pending',
      paymentMethod,
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const cb =
      callback_url ||
      `${baseUrl}/dashboard/wallet/success?depositId=${deposit._id}&paymentMethod=${paymentMethod}`;

    const initParams = {
      amount: parsedAmount,
      email,
      depositId: deposit._id.toString(),
      callbackUrl: cb,
    };

    const result =
      paymentMethod === 'flutterwave'
        ? await initializeFlutterwave(initParams)
        : await initializePaystack(initParams);

    return NextResponse.json({
      depositId: deposit._id,
      paymentMethod: paymentMethod as OnlinePaymentMethod,
      redirectUrl: result.redirectUrl,
      reference: result.reference,
    });
  } catch (error) {
    console.error('Wallet deposit initialize error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
