import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();

    const orders = await Order.find({ userId: auth.id })
      .populate('campaignId', 'title status')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map((order) => ({
      id: order._id.toString(),
      campaignId: order.campaignId?._id?.toString() || order.campaignId,
      campaignTitle: (order.campaignId as { title?: string })?.title || '—',
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      proofImageUrl: order.proofImageUrl,
      proofNote: order.proofNote,
      proofSubmittedAt: order.proofSubmittedAt,
      createdAt: order.createdAt,
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error('User orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
