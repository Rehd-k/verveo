import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { Campaign } from '@/models/Campaign';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { hashPassword } from '@/lib/auth';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['advertiser', 'retailer', 'admin']).default('advertiser'),
  walletBalance: z.number().optional(),
  designCredit: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const campaignCount = await Campaign.countDocuments({ userId: user._id });
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          walletBalance: user.walletBalance,
          designCredit: user.designCredit,
          campaignCount,
          createdAt: user.createdAt,
        };
      })
    );

    return NextResponse.json({ users: usersWithCounts, total, page, limit });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, name, role, walletBalance, designCredit } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = await User.create({
      email,
      password: await hashPassword(password),
      name,
      role,
      walletBalance: walletBalance ?? 0,
      designCredit: designCredit ?? 150000,
    });

    return NextResponse.json(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        walletBalance: user.walletBalance,
        designCredit: user.designCredit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
