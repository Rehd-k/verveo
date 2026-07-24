import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';
import { requireAuth, isAuthUser } from '@/lib/apiAuth';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['application/pdf', 'pdf'],
]);

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!isAuthUser(auth)) return auth;

    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file');
    const campaignId = formData.get('campaignId');
    const amount = formData.get('amount');
    const note = formData.get('note');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Proof file is required' }, { status: 400 });
    }

    if (!campaignId || typeof campaignId !== 'string') {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.userId.toString() !== auth.id && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, and PDF files are supported' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be 5MB or smaller' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.${extension}`;
    const filepath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const order = await Order.create({
      userId: auth.id,
      campaignId,
      amount: parsedAmount,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      proofImageUrl: `/uploads/payment-proofs/${filename}`,
      proofNote: typeof note === 'string' ? note.trim() || undefined : undefined,
      proofSubmittedAt: new Date(),
    });

    return NextResponse.json({
      orderId: order._id,
      status: 'pending',
      proofImageUrl: order.proofImageUrl,
    });
  } catch (error) {
    console.error('Payment proof error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
