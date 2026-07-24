import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';
import { verifyPaystack } from '@/lib/payments/paystack';
import { verifyFlutterwave } from '@/lib/payments/flutterwave';
import { markOrderPaid } from '@/lib/payments/markOrderPaid';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();
    const { reference, orderId, transaction_id, tx_ref, paymentMethod } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId.toString() !== auth.id && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    const method = paymentMethod || order.paymentMethod;
    let verifyResult;

    if (method === 'flutterwave') {
      if (!transaction_id) {
        return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
      }
      verifyResult = await verifyFlutterwave({
        transactionId: String(transaction_id),
        txRef: tx_ref,
      });
    } else {
      if (!reference) {
        return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
      }
      verifyResult = await verifyPaystack({ reference });
    }

    if (verifyResult.success) {
      await markOrderPaid(orderId, verifyResult.transactionId);
      return NextResponse.json({ success: true, data: verifyResult.raw });
    }

    return NextResponse.json({ success: false, data: verifyResult.raw });
  } catch (error) {
    console.error('Payment verify error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
