import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { Campaign } from '@/models/Campaign';
import { Order } from '@/models/Order';
import { WalletLedgerEntry } from '@/models/WalletLedgerEntry';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { setBalanceViaLedger } from '@/lib/wallet/ledger';
import { migrateDesignCreditToWallet } from '@/lib/wallet/migrateDesignCredit';
import { writeAuditLog } from '@/lib/audit';

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

    await migrateDesignCreditToWallet(id);

    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [campaigns, orders, ledger] = await Promise.all([
      Campaign.find({ userId: id }).sort({ createdAt: -1 }).lean(),
      Order.find({ userId: id }).sort({ createdAt: -1 }).populate('campaignId', 'title').lean(),
      WalletLedgerEntry.find({ userId: id }).sort({ createdAt: -1 }).limit(50).lean(),
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
      ledger: ledger.map((e) => ({
        id: e._id.toString(),
        account: e.account,
        amount: e.amount,
        balanceAfter: e.balanceAfter,
        type: e.type,
        reference: e.reference,
        createdAt: e.createdAt,
      })),
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

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await migrateDesignCreditToWallet(id);

    const before = {
      name: user.name,
      role: user.role,
      walletBalance: user.walletBalance,
      designCredit: user.designCredit,
    };

    const profileUpdate: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) profileUpdate.name = parsed.data.name;
    if (parsed.data.role !== undefined) profileUpdate.role = parsed.data.role;

    if (Object.keys(profileUpdate).length > 0) {
      await User.findByIdAndUpdate(id, profileUpdate);
    }

    const ts = Date.now();

    if (typeof parsed.data.walletBalance === 'number') {
      await setBalanceViaLedger({
        userId: id,
        account: 'wallet',
        targetBalance: parsed.data.walletBalance,
        reference: `admin_wallet_${id}_${ts}`,
        createdBy: auth.id,
      });
    }

    const updated = await User.findById(id).select('-password');
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await writeAuditLog({
      actorId: auth.id,
      action: 'user.update',
      targetType: 'User',
      targetId: id,
      before,
      after: {
        name: updated.name,
        role: updated.role,
        walletBalance: updated.walletBalance,
        designCredit: updated.designCredit,
      },
      ip: request.headers.get('x-forwarded-for'),
    });

    return NextResponse.json({
      id: updated._id.toString(),
      email: updated.email,
      name: updated.name,
      role: updated.role,
      walletBalance: updated.walletBalance,
      designCredit: updated.designCredit,
    });
  } catch (error) {
    console.error('Admin patch user error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
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

    await writeAuditLog({
      actorId: auth.id,
      action: 'user.delete',
      targetType: 'User',
      targetId: id,
      before: { email: user.email, role: user.role },
      ip: request.headers.get('x-forwarded-for'),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
