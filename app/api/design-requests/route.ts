import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';
import { Campaign } from '@/models/Campaign';
import { DesignRequest } from '@/models/DesignRequest';
import { DESIGN_SERVICE_FEE } from '@/lib/designCredit';
import { debitWallet, InsufficientBalanceError } from '@/lib/wallet/ledger';
import { migrateDesignCreditToWallet } from '@/lib/wallet/migrateDesignCredit';

const createSchema = z.object({
  containerDescription: z.string().min(10).max(2000),
  preferredContact: z.enum(['video_call', 'whatsapp', 'email', 'phone']),
  contactValue: z.string().min(3).max(200),
  scheduledAt: z.string().min(1),
  campaignId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const requests = await DesignRequest.find({ userId: auth.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      requests.map((r) => ({
        id: r._id.toString(),
        userId: r.userId.toString(),
        campaignId: r.campaignId?.toString(),
        containerDescription: r.containerDescription,
        preferredContact: r.preferredContact,
        contactValue: r.contactValue,
        scheduledAt: r.scheduledAt,
        status: r.status,
        amountCharged: r.amountCharged,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Design requests list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    await migrateDesignCreditToWallet(auth.id);

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { containerDescription, preferredContact, contactValue, scheduledAt, campaignId } =
      parsed.data;

    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled date/time' }, { status: 400 });
    }
    if (scheduled.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: 'Please choose a future date and time' }, { status: 400 });
    }

    if (campaignId) {
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
    }

    const fee = DESIGN_SERVICE_FEE;

    const designRequest = await DesignRequest.create({
      userId: auth.id,
      campaignId: campaignId || undefined,
      containerDescription,
      preferredContact,
      contactValue,
      scheduledAt: scheduled,
      status: 'pending',
      amountCharged: fee,
    });

    try {
      const ledger = await debitWallet({
        userId: auth.id,
        amount: fee,
        type: 'design_fee',
        reference: `design_request_${designRequest._id}`,
        account: 'wallet',
        relatedId: designRequest._id.toString(),
        relatedModel: 'DesignRequest',
        metadata: { campaignId },
      });

      if (campaignId) {
        await Campaign.findByIdAndUpdate(campaignId, {
          $set: {
            'design.handoff': 'verveo_team',
          },
        });
      }

      return NextResponse.json(
        {
          id: designRequest._id.toString(),
          status: designRequest.status,
          amountCharged: designRequest.amountCharged,
          scheduledAt: designRequest.scheduledAt,
          walletBalance: ledger.balanceAfter,
        },
        { status: 201 }
      );
    } catch (err) {
      await DesignRequest.findByIdAndDelete(designRequest._id);

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
    console.error('Design request create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
