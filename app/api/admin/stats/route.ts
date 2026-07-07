import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { getAdminStats } from '@/lib/adminStats';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
