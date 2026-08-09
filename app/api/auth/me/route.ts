import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/apiAuth';
import { migrateDesignCreditToWallet } from '@/lib/wallet/migrateDesignCredit';
import { withClearedAuthCookie } from '@/lib/authCookies';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const migrated = await migrateDesignCreditToWallet(auth.id);

    const user = await User.findById(auth.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletBalance: migrated.walletBalance,
        designCredit: migrated.designCredit,
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  return withClearedAuthCookie(response);
}
