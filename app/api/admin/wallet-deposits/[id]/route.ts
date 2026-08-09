import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { WalletDeposit } from '@/models/WalletDeposit';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { markDepositPaid } from '@/lib/wallet/markDepositPaid';
import { writeAuditLog } from '@/lib/audit';

const patchSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed']),
  transactionId: z.string().optional(),
});

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
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const deposit = await WalletDeposit.findById(id);
    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const before = {
      status: deposit.status,
      transactionId: deposit.transactionId,
    };

    if (parsed.data.status === 'paid') {
      if (deposit.status === 'paid') {
        return NextResponse.json(deposit);
      }
      if (deposit.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending deposits can be marked paid' },
          { status: 400 }
        );
      }

      const updated = await markDepositPaid(id, parsed.data.transactionId);
      await writeAuditLog({
        actorId: auth.id,
        action: 'wallet_deposit.mark_paid',
        targetType: 'WalletDeposit',
        targetId: id,
        before,
        after: {
          status: updated?.status,
          transactionId: updated?.transactionId,
        },
        ip: request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(updated);
    }

    if (parsed.data.status === 'failed') {
      if (deposit.status === 'paid') {
        return NextResponse.json(
          { error: 'Cannot fail an already paid deposit' },
          { status: 400 }
        );
      }
      deposit.status = 'failed';
      if (parsed.data.transactionId) deposit.transactionId = parsed.data.transactionId;
      await deposit.save();

      await writeAuditLog({
        actorId: auth.id,
        action: 'wallet_deposit.mark_failed',
        targetType: 'WalletDeposit',
        targetId: id,
        before,
        after: { status: deposit.status, transactionId: deposit.transactionId },
        ip: request.headers.get('x-forwarded-for'),
      });

      return NextResponse.json(deposit);
    }

    return NextResponse.json({ error: 'Unsupported status transition' }, { status: 400 });
  } catch (error) {
    console.error('Admin patch wallet deposit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
