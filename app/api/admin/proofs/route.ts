import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Proof } from '@/models/Proof';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

const createProofSchema = z.object({
  retailerId: z.string(),
  campaignId: z.string().optional(),
  imageUrl: z.string().url(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [proofs, total] = await Promise.all([
      Proof.find(filter)
        .sort({ status: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('retailerId', 'businessName venueType')
        .populate('campaignId', 'title')
        .lean(),
      Proof.countDocuments(filter),
    ]);

    return NextResponse.json({
      proofs: proofs.map((p) => ({
        id: p._id.toString(),
        retailerId: (p.retailerId as { _id?: { toString(): string } })?._id?.toString() || '',
        campaignId: (p.campaignId as { _id?: { toString(): string } })?._id?.toString(),
        imageUrl: p.imageUrl,
        status: p.status,
        notes: p.notes,
        reviewedBy: p.reviewedBy?.toString(),
        reviewedAt: p.reviewedAt,
        createdAt: p.createdAt,
        retailer: p.retailerId,
        campaign: p.campaignId,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin proofs list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const body = await request.json();
    const parsed = createProofSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const proof = await Proof.create(parsed.data);
    return NextResponse.json(proof, { status: 201 });
  } catch (error) {
    console.error('Admin create proof error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
