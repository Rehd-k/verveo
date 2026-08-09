import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletDeposit } from '@/models/WalletDeposit';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const deposits = await WalletDeposit.find({ userId: auth.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      deposits: deposits.map((d) => ({
        id: d._id.toString(),
        amount: d.amount,
        status: d.status,
        paymentMethod: d.paymentMethod,
        transactionId: d.transactionId,
        proofImageUrl: d.proofImageUrl,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error('Wallet deposits list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
