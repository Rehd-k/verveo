import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Proof } from '@/models/Proof';
import { Campaign } from '@/models/Campaign';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

const patchProofSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().optional(),
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
    const parsed = patchProofSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const proof = await Proof.findByIdAndUpdate(
      id,
      {
        ...parsed.data,
        reviewedBy: auth.id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!proof) {
      return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
    }

    if (parsed.data.status === 'approved' && proof.campaignId) {
      await Campaign.findByIdAndUpdate(proof.campaignId, {
        $inc: { 'stats.impressions': 1 },
      });
    }

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Admin patch proof error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
