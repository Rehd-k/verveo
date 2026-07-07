import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Retailer } from '@/models/Retailer';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

const createRetailerSchema = z.object({
  userId: z.string(),
  businessName: z.string().min(1),
  venueType: z.string().min(1),
  city: z.string().min(1).optional(),
  status: z.enum(['pending', 'active', 'suspended']).optional(),
  address: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  allowance: z.number().optional(),
  currentStock: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { venueType: { $regex: search, $options: 'i' } },
      ];
    }

    const [retailers, total] = await Promise.all([
      Retailer.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'email name')
        .lean(),
      Retailer.countDocuments(filter),
    ]);

    return NextResponse.json({
      retailers: retailers.map((r) => ({
        id: r._id.toString(),
        userId: (r.userId as { _id?: { toString(): string } })?._id?.toString() || r.userId?.toString(),
        businessName: r.businessName,
        venueType: r.venueType,
        city: r.city,
        status: r.status,
        address: r.address,
        location: r.location,
        allowance: r.allowance,
        currentStock: r.currentStock,
        createdAt: r.createdAt,
        user: r.userId,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin retailers list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const body = await request.json();
    const parsed = createRetailerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const retailer = await Retailer.create(parsed.data);
    return NextResponse.json(retailer, { status: 201 });
  } catch (error) {
    console.error('Admin create retailer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
