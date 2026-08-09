import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletLedgerEntry } from '@/models/WalletLedgerEntry';
import { User } from '@/models/User';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account') || 'wallet';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));

    if (!['wallet', 'design'].includes(account)) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
    }

    const user = await User.findById(auth.id).select('walletBalance designCredit');
    const entries = await WalletLedgerEntry.find({ userId: auth.id, account })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      walletBalance: user?.walletBalance ?? 0,
      designCredit: user?.designCredit ?? 0,
      entries: entries.map((e) => ({
        id: e._id.toString(),
        account: e.account,
        amount: e.amount,
        balanceAfter: e.balanceAfter,
        type: e.type,
        reference: e.reference,
        relatedId: e.relatedId?.toString(),
        relatedModel: e.relatedModel,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error('Wallet ledger list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
