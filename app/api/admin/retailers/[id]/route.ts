import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Retailer } from '@/models/Retailer';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

const patchRetailerSchema = z.object({
  businessName: z.string().min(1).optional(),
  venueType: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  status: z.enum(['pending', 'active', 'suspended']).optional(),
  address: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  allowance: z.number().optional(),
  currentStock: z.number().optional(),
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

    const retailer = await Retailer.findById(id).populate('userId', 'email name').lean();
    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: retailer._id.toString(),
      ...retailer,
      user: retailer.userId,
    });
  } catch (error) {
    console.error('Admin get retailer error:', error);
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
    const parsed = patchRetailerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const retailer = await Retailer.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    return NextResponse.json(retailer);
  } catch (error) {
    console.error('Admin patch retailer error:', error);
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
    await dbConnect();

    const retailer = await Retailer.findByIdAndDelete(id);
    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete retailer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
