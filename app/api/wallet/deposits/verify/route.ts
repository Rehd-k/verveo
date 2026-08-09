import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletDeposit } from '@/models/WalletDeposit';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';
import { verifyPaystack } from '@/lib/payments/paystack';
import { verifyFlutterwave } from '@/lib/payments/flutterwave';
import { markDepositPaid } from '@/lib/wallet/markDepositPaid';
import { amountMismatchError, amountsMatch } from '@/lib/payments/amount';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();
    const { reference, depositId, transaction_id, tx_ref, paymentMethod } = await request.json();

    if (!depositId) {
      return NextResponse.json({ error: 'Missing depositId' }, { status: 400 });
    }

    const deposit = await WalletDeposit.findById(depositId);
    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    if (deposit.userId.toString() !== auth.id && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (deposit.status === 'paid') {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    const method = paymentMethod || deposit.paymentMethod;
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

    if (!verifyResult.success) {
      return NextResponse.json({ success: false, data: verifyResult.raw });
    }

    if (
      typeof verifyResult.amountPaid !== 'number' ||
      !amountsMatch(Number(deposit.amount), verifyResult.amountPaid)
    ) {
      return NextResponse.json(
        amountMismatchError(Number(deposit.amount), Number(verifyResult.amountPaid ?? NaN)),
        { status: 400 }
      );
    }

    await markDepositPaid(depositId, verifyResult.transactionId);
    return NextResponse.json({ success: true, data: verifyResult.raw });
  } catch (error) {
    console.error('Wallet deposit verify error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
