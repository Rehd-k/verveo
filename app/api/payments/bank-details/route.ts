import { NextResponse } from 'next/server';
import { getPlatformSettings } from '@/lib/platformSettings';

export async function GET() {
  try {
    const settings = await getPlatformSettings();
    const accountName = settings.bankAccountName?.trim() || '';
    const accountNumber = settings.bankAccountNumber?.trim() || '';
    const bankName = settings.bankName?.trim() || '';

    if (!accountName || !accountNumber || !bankName) {
      return NextResponse.json({ configured: false });
    }

    return NextResponse.json({
      configured: true,
      accountName,
      accountNumber,
      bankName,
    });
  } catch (error) {
    console.error('Bank details error:', error);
    return NextResponse.json({ configured: false });
  }
}
