import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';
import { User } from '@/models/User';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';

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

    const user = await User.findOneAndUpdate(
      {
        _id: auth.id,
        walletBalance: { $gte: amount },
      },
      { $inc: { walletBalance: -amount } },
      { new: true }
    );

    if (!user) {
      const current = await User.findById(auth.id).select('walletBalance');
      return NextResponse.json(
        {
          error: 'Insufficient wallet balance',
          walletBalance: current?.walletBalance ?? 0,
          required: amount,
        },
        { status: 400 }
      );
    }

    try {
      const order = await Order.create({
        userId: auth.id,
        campaignId,
        amount,
        status: 'paid',
        paymentMethod: 'wallet',
        transactionId: `wallet_${Date.now()}`,
      });

      await Campaign.findByIdAndUpdate(campaignId, { status: 'processing' });

      return NextResponse.json({
        orderId: order._id,
        paymentMethod: 'wallet',
        status: 'paid',
        walletBalance: user.walletBalance,
      });
    } catch (createError) {
      await User.findByIdAndUpdate(auth.id, { $inc: { walletBalance: amount } });
      throw createError;
    }
  } catch (error) {
    console.error('Wallet payment error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
