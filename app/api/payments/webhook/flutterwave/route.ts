import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { WalletDeposit } from '@/models/WalletDeposit';
import { verifyFlutterwaveWebhookHash } from '@/lib/payments/flutterwave';
import { markOrderPaid } from '@/lib/payments/markOrderPaid';
import { markDepositPaid } from '@/lib/wallet/markDepositPaid';
import { amountsMatch } from '@/lib/payments/amount';

export async function POST(request: NextRequest) {
  try {
    const hash = request.headers.get('verif-hash');
    if (!verifyFlutterwaveWebhookHash(hash)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body = await request.json();
    const event = body.event;
    const data = body.data;

    if (event === 'charge.completed' && data?.status === 'successful') {
      const orderId = data.meta?.orderId;
      const depositId = data.meta?.depositId;
      const transactionId = String(data.id || data.transaction_id || '');
      const paidNgn = data.amount !== undefined && data.amount !== null ? Number(data.amount) : NaN;

      await dbConnect();

      if (depositId) {
        const deposit = await WalletDeposit.findById(depositId);
        if (!deposit) {
          console.warn('Flutterwave webhook: deposit not found', depositId);
        } else if (!amountsMatch(Number(deposit.amount), paidNgn)) {
          console.warn('Flutterwave webhook: deposit amount mismatch', {
            depositId,
            expected: deposit.amount,
            paid: paidNgn,
          });
        } else {
          await markDepositPaid(depositId, transactionId);
        }
      } else if (orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
          console.warn('Flutterwave webhook: order not found', orderId);
        } else if (!amountsMatch(Number(order.amount), paidNgn)) {
          console.warn('Flutterwave webhook: order amount mismatch', {
            orderId,
            expected: order.amount,
            paid: paidNgn,
          });
        } else {
          await markOrderPaid(orderId, transactionId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Flutterwave webhook error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
