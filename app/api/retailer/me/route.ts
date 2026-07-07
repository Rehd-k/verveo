import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRetailerProfile, isAuthUser, requireRetailer } from '@/lib/apiAuth';

const patchProfileSchema = z.object({
  businessName: z.string().min(1).optional(),
  venueType: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  address: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

interface RetailerProfileDocument {
  _id: { toString(): string };
  userId: { toString(): string };
  businessName: string;
  venueType: string;
  city: string;
  status: string;
  address?: string;
  location?: { lat?: number; lng?: number };
  allowance: number;
  currentStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

function serializeRetailer(retailer: RetailerProfileDocument) {
  return {
    id: retailer._id.toString(),
    userId: retailer.userId.toString(),
    businessName: retailer.businessName,
    venueType: retailer.venueType,
    city: retailer.city,
    status: retailer.status,
    address: retailer.address,
    location: retailer.location,
    allowance: retailer.allowance,
    currentStock: retailer.currentStock,
    createdAt: retailer.createdAt,
    updatedAt: retailer.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  const retailer = await getRetailerProfile(auth.id);
  if (!retailer) {
    return NextResponse.json({ error: 'Retailer profile not found' }, { status: 404 });
  }

  return NextResponse.json({ retailer: serializeRetailer(retailer), user: auth });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  const retailer = await getRetailerProfile(auth.id);
  if (!retailer) {
    return NextResponse.json({ error: 'Retailer profile not found' }, { status: 404 });
  }

  const parsed = patchProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  retailer.set(parsed.data);
  await retailer.save();

  return NextResponse.json({ retailer: serializeRetailer(retailer) });
}
