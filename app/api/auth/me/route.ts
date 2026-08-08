import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (
      !payload ||
      typeof payload === 'string' ||
      !('userId' in payload) ||
      typeof payload.userId !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletBalance: user.walletBalance,
        designCredit: user.designCredit,
      },
      token,
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
