import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Scan } from '@/models/Scan';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { formatScanForFeed } from '@/lib/platformAnalytics';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '30', 10));
    const campaignId = searchParams.get('campaignId');

    const filter: Record<string, unknown> = {};
    if (campaignId) filter.campaignId = campaignId;

    const [scans, total] = await Promise.all([
      Scan.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('campaignId', 'title')
        .lean(),
      Scan.countDocuments(filter),
    ]);

    return NextResponse.json({
      scans: scans.map(formatScanForFeed),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin scans list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
