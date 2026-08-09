import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletDeposit } from '@/models/WalletDeposit';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [deposits, total] = await Promise.all([
      WalletDeposit.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'email name')
        .lean(),
      WalletDeposit.countDocuments(filter),
    ]);

    return NextResponse.json({
      deposits: deposits.map((d) => {
        const user = d.userId as unknown as { _id: { toString(): string }; email?: string; name?: string } | null;
        return {
          id: d._id.toString(),
          amount: d.amount,
          status: d.status,
          paymentMethod: d.paymentMethod,
          transactionId: d.transactionId,
          proofImageUrl: d.proofImageUrl,
          proofNote: d.proofNote,
          proofSubmittedAt: d.proofSubmittedAt,
          createdAt: d.createdAt,
          user: user
            ? {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
              }
            : null,
        };
      }),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin wallet deposits list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
