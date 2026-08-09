import { NextResponse } from 'next/server';
import { withClearedAuthCookie } from '@/lib/authCookies';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return withClearedAuthCookie(response);
}
