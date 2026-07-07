import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { getPlatformAnalytics } from '@/lib/platformAnalytics';
import type { AnalyticsRange } from '@/lib/analytics';

const VALID_RANGES: AnalyticsRange[] = ['24h', '7d', '30d'];

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '7d';
    const range = VALID_RANGES.includes(rangeParam as AnalyticsRange)
      ? (rangeParam as AnalyticsRange)
      : '7d';

    const analytics = await getPlatformAnalytics(range);
    return NextResponse.json({ range, ...analytics });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
