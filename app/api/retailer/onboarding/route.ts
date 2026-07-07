import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { isAuthUser, requireRetailer } from '@/lib/apiAuth';
import { Retailer } from '@/models/Retailer';

const onboardingSchema = z.object({
  businessName: z.string().min(2),
  venueType: z.string().min(2),
  city: z.string().min(2),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();

    const existing = await Retailer.findOne({ userId: auth.id });
    if (existing) {
      return NextResponse.json({ error: 'Retailer profile already exists' }, { status: 409 });
    }

    const parsed = onboardingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { lat, lng, ...profile } = parsed.data;
    const retailer = await Retailer.create({
      ...profile,
      userId: auth.id,
      location: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    });

    return NextResponse.json(
      {
        retailer: {
          id: retailer._id.toString(),
          businessName: retailer.businessName,
          venueType: retailer.venueType,
          city: retailer.city,
          status: retailer.status,
          address: retailer.address,
          allowance: retailer.allowance,
          currentStock: retailer.currentStock,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Retailer onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
