import { NextResponse } from 'next/server';

export async function GET() {
  const accountName = process.env.BANK_ACCOUNT_NAME;
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
  const bankName = process.env.BANK_NAME;

  if (!accountName || !accountNumber || !bankName) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json({
    configured: true,
    accountName,
    accountNumber,
    bankName,
  });
}
