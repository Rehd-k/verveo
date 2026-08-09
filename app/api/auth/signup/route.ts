import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { getPlatformSettings } from '@/lib/platformSettings';
import { creditWallet } from '@/lib/wallet/ledger';
import { withAuthCookie } from '@/lib/authCookies';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'admin') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const signupRole = role === 'retailer' ? 'retailer' : 'advertiser';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const settings = await getPlatformSettings();
    // Both legacy design signup credit and wallet credit land in the single wallet
    const designBonus =
      typeof settings.defaultDesignCredit === 'number' ? settings.defaultDesignCredit : 0;
    const walletBonus =
      typeof settings.defaultWalletCredit === 'number' ? settings.defaultWalletCredit : 0;
    const totalSignupCredit = designBonus + walletBonus;

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role: signupRole,
      designCredit: 0,
      walletBalance: 0,
    });

    const userId = newUser._id.toString();

    if (totalSignupCredit > 0) {
      await creditWallet({
        userId,
        amount: totalSignupCredit,
        type: 'signup_credit',
        reference: `signup_wallet_${userId}`,
        account: 'wallet',
        metadata: {
          fromWalletSetting: walletBonus,
          fromDesignSetting: designBonus,
        },
      });
    }

    const refreshed = await User.findById(userId).select('-password');
    const token = generateToken(userId, newUser.role);

    const response = NextResponse.json(
      {
        user: {
          id: refreshed!._id,
          email: refreshed!.email,
          name: refreshed!.name,
          role: refreshed!.role,
          walletBalance: refreshed!.walletBalance,
          designCredit: refreshed!.designCredit ?? 0,
        },
      },
      { status: 201 }
    );

    return withAuthCookie(response, token);
  } catch (error) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
