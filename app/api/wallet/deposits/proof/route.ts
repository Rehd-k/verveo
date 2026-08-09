import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletDeposit } from '@/models/WalletDeposit';
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
    const amount = formData.get('amount');
    const note = formData.get('note');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Proof file is required' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (parsedAmount < 100) {
      return NextResponse.json({ error: 'Minimum deposit is ₦100' }, { status: 400 });
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'wallet-deposit-proofs');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.${extension}`;
    const filepath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const deposit = await WalletDeposit.create({
      userId: auth.id,
      amount: parsedAmount,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      proofImageUrl: `/uploads/wallet-deposit-proofs/${filename}`,
      proofNote: typeof note === 'string' ? note.trim() || undefined : undefined,
      proofSubmittedAt: new Date(),
    });

    return NextResponse.json({
      depositId: deposit._id,
      status: 'pending',
      proofImageUrl: deposit.proofImageUrl,
    });
  } catch (error) {
    console.error('Wallet deposit proof error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
