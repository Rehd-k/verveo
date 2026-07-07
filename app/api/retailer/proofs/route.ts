import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRetailerProfile, isAuthUser, requireActiveRetailer, requireRetailer } from '@/lib/apiAuth';
import { Proof } from '@/models/Proof';

const proofSchema = z.object({
  campaignId: z.string().optional(),
  imageUrl: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  const retailer = await getRetailerProfile(auth.id);
  if (!retailer) {
    return NextResponse.json({ error: 'Retailer profile not found' }, { status: 404 });
  }

  const proofs = await Proof.find({ retailerId: retailer._id })
    .sort({ createdAt: -1 })
    .populate('campaignId', 'title')
    .lean();

  return NextResponse.json({
    proofs: proofs.map((proof) => ({
      id: proof._id.toString(),
      campaignId: (proof.campaignId as { _id?: { toString(): string } })?._id?.toString(),
      campaign: proof.campaignId,
      imageUrl: proof.imageUrl,
      status: proof.status,
      notes: proof.notes,
      reviewedAt: proof.reviewedAt,
      createdAt: proof.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const result = await requireActiveRetailer(request, { write: true });
  if (result instanceof NextResponse) return result;

  const { retailer } = result;

  const parsed = proofSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const proof = await Proof.create({
    ...parsed.data,
    retailerId: retailer._id,
  });

  return NextResponse.json(
    {
      proof: {
        id: proof._id.toString(),
        imageUrl: proof.imageUrl,
        status: proof.status,
        notes: proof.notes,
        createdAt: proof.createdAt,
      },
    },
    { status: 201 }
  );
}
