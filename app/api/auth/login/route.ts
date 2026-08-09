import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';
import { withAuthCookie } from '@/lib/authCookies';
import { migrateDesignCreditToWallet } from '@/lib/wallet/migrateDesignCredit';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const userId = user._id.toString();
    const migrated = await migrateDesignCreditToWallet(userId);
    const token = generateToken(userId, user.role);

    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletBalance: migrated.walletBalance,
        designCredit: migrated.designCredit,
      },
    });

    return withAuthCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
