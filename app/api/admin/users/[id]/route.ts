import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { Campaign } from '@/models/Campaign';
import { Order } from '@/models/Order';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

const patchUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['advertiser', 'retailer', 'admin']).optional(),
  walletBalance: z.number().optional(),
  designCredit: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [campaigns, orders] = await Promise.all([
      Campaign.find({ userId: id }).sort({ createdAt: -1 }).lean(),
      Order.find({ userId: id }).sort({ createdAt: -1 }).populate('campaignId', 'title').lean(),
    ]);

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        walletBalance: user.walletBalance,
        designCredit: user.designCredit,
        createdAt: user.createdAt,
      },
      campaigns,
      orders,
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { id } = await params;
    await dbConnect();

    const body = await request.json();
    const parsed = patchUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, parsed.data, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      walletBalance: user.walletBalance,
      designCredit: user.designCredit,
    });
  } catch (error) {
    console.error('Admin patch user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { id } = await params;

    if (id === auth.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
