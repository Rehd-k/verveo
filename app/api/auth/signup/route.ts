import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { getPlatformSettings } from '@/lib/platformSettings';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'admin') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const signupRole = role === 'retailer' ? 'retailer' : 'advertiser';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const settings = await getPlatformSettings();
    const designCredit =
      typeof settings.defaultDesignCredit === 'number'
        ? settings.defaultDesignCredit
        : 150000;
    const walletBalance =
      typeof settings.defaultWalletCredit === 'number'
        ? settings.defaultWalletCredit
        : 0;

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role: signupRole,
      designCredit,
      walletBalance,
    });

    const token = generateToken(newUser._id.toString(), newUser.role);

    return NextResponse.json(
      {
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          walletBalance: newUser.walletBalance,
          designCredit: newUser.designCredit,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
