import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyFlutterwaveWebhookHash } from '@/lib/payments/flutterwave';
import { markOrderPaid } from '@/lib/payments/markOrderPaid';

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
      const transactionId = String(data.id || data.transaction_id || '');

      if (orderId) {
        await dbConnect();
        await markOrderPaid(orderId, transactionId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Flutterwave webhook error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
