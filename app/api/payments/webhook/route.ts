import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { WalletDeposit } from '@/models/WalletDeposit';
import { markOrderPaid } from '@/lib/payments/markOrderPaid';
import { markDepositPaid } from '@/lib/wallet/markDepositPaid';
import { amountsMatch } from '@/lib/payments/amount';

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
      const depositId = data.metadata?.depositId;
      const reference = data.reference;
      const paidNgn = typeof data.amount === 'number' ? data.amount / 100 : NaN;

      await dbConnect();

      if (depositId) {
        const deposit = await WalletDeposit.findById(depositId);
        if (!deposit) {
          console.warn('Paystack webhook: deposit not found', depositId);
        } else if (!amountsMatch(Number(deposit.amount), paidNgn)) {
          console.warn('Paystack webhook: deposit amount mismatch', {
            depositId,
            expected: deposit.amount,
            paid: paidNgn,
          });
        } else {
          await markDepositPaid(depositId, reference);
        }
      } else if (orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
          console.warn('Paystack webhook: order not found', orderId);
        } else if (!amountsMatch(Number(order.amount), paidNgn)) {
          console.warn('Paystack webhook: order amount mismatch', {
            orderId,
            expected: order.amount,
            paid: paidNgn,
          });
        } else {
          await markOrderPaid(orderId, reference);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
