import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';
import { hashPassword, verifyPassword } from '@/lib/auth';

const patchUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    const body = await request.json();
    const parsed = patchUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, currentPassword, newPassword } = parsed.data;

    if (newPassword && !currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(auth.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (name) {
      updates.name = name;
    }

    if (newPassword) {
      const valid = await verifyPassword(currentPassword!, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      updates.password = await hashPassword(newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(auth.id, updates, { new: true }).select('-password');

    return NextResponse.json({
      user: {
        id: updated!._id,
        email: updated!.email,
        name: updated!.name,
        role: updated!.role,
        walletBalance: updated!.walletBalance,
      },
    });
  } catch (error) {
    console.error('User profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
