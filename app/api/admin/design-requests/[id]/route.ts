import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { DesignRequest } from '@/models/DesignRequest';

const patchSchema = z.object({
  status: z.enum(['pending', 'contacted', 'completed', 'cancelled']).optional(),
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

    const updated = await DesignRequest.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Design request not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updated._id.toString(),
      status: updated.status,
      preferredContact: updated.preferredContact,
      contactValue: updated.contactValue,
      scheduledAt: updated.scheduledAt,
      amountCharged: updated.amountCharged,
    });
  } catch (error) {
    console.error('Admin design request patch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
