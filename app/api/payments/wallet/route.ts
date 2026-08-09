import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';
import { debitWallet, InsufficientBalanceError } from '@/lib/wallet/ledger';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json({ error: 'Invalid campaignId' }, { status: 400 });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.userId.toString() !== auth.id && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Campaign is not payable (must be a draft)' },
        { status: 400 }
      );
    }

    const amount = Number(campaign.budget);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid campaign budget' }, { status: 400 });
    }

    const existingPaid = await Order.findOne({
      campaignId,
      status: 'paid',
    });
    if (existingPaid) {
      return NextResponse.json({ error: 'Campaign already paid' }, { status: 400 });
    }

    const order = await Order.create({
      userId: auth.id,
      campaignId,
      amount,
      status: 'pending',
      paymentMethod: 'wallet',
    });

    try {
      const ledger = await debitWallet({
        userId: auth.id,
        amount,
        type: 'campaign_payment',
        reference: `wallet_order_${order._id}`,
        account: 'wallet',
        relatedId: order._id.toString(),
        relatedModel: 'Order',
        metadata: { campaignId },
      });

      order.status = 'paid';
      order.transactionId = `wallet_order_${order._id}`;
      await order.save();

      await Campaign.findByIdAndUpdate(campaignId, { status: 'processing' });

      return NextResponse.json({
        orderId: order._id,
        paymentMethod: 'wallet',
        status: 'paid',
        walletBalance: ledger.balanceAfter,
      });
    } catch (err) {
      await Order.findByIdAndUpdate(order._id, { status: 'failed' });

      if (err instanceof InsufficientBalanceError) {
        return NextResponse.json(
          {
            error: 'Insufficient wallet balance',
            walletBalance: err.balance,
            required: err.required,
          },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('Wallet payment error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
