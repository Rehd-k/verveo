import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { User } from '@/models/User';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
    const status = searchParams.get('status');
    const productType = searchParams.get('productType');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (productType) filter.productType = productType;

    let campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Campaign.countDocuments(filter);

    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = users.map((u) => u._id);
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } },
      ];
      campaigns = await Campaign.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    const ownerIds = [...new Set(campaigns.map((c) => c.userId.toString()))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select('email name').lean();
    const ownerMap = new Map(owners.map((o) => [o._id.toString(), o]));

    const result = campaigns.map((c) => ({
      ...c,
      id: c._id.toString(),
      owner: ownerMap.get(c.userId.toString())
        ? {
            id: c.userId.toString(),
            email: ownerMap.get(c.userId.toString())!.email,
            name: ownerMap.get(c.userId.toString())!.name,
          }
        : undefined,
    }));

    return NextResponse.json({ campaigns: result, total, page, limit });
  } catch (error) {
    console.error('Admin campaigns list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
