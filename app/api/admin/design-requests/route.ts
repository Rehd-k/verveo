import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { DesignRequest } from '@/models/DesignRequest';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [requests, total] = await Promise.all([
      DesignRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('campaignId', 'title')
        .lean(),
      DesignRequest.countDocuments(filter),
    ]);

    return NextResponse.json({
      requests: requests.map((r) => {
        const userDoc = r.userId as unknown as { _id?: { toString(): string }; name?: string; email?: string } | null;
        const campaignDoc = r.campaignId as unknown as { _id?: { toString(): string }; title?: string } | null;
        return {
          id: r._id.toString(),
          userId: userDoc?._id?.toString() || String(r.userId),
          user: userDoc
            ? { id: userDoc._id?.toString(), name: userDoc.name, email: userDoc.email }
            : undefined,
          campaignId: campaignDoc?._id?.toString(),
          campaign: campaignDoc ? { _id: campaignDoc._id?.toString(), title: campaignDoc.title } : undefined,
          containerDescription: r.containerDescription,
          preferredContact: r.preferredContact,
          contactValue: r.contactValue,
          scheduledAt: r.scheduledAt,
          status: r.status,
          amountCharged: r.amountCharged,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin design requests list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
