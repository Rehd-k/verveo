import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { Retailer } from '@/models/Retailer';
import { verifyToken } from '@/lib/auth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'advertiser' | 'retailer' | 'admin';
  walletBalance?: number;
  designCredit?: number;
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookieToken = request.cookies.get('token')?.value;
  return cookieToken || null;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (
    !payload ||
    typeof payload === 'string' ||
    !('userId' in payload) ||
    typeof payload.userId !== 'string'
  ) {
    return null;
  }

  await dbConnect();
  const user = await User.findById(payload.userId).select('-password');
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    walletBalance: user.walletBalance,
    designCredit: user.designCredit,
  };
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();
  return user;
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'admin') return forbiddenResponse('Admin access required');
  return result;
}

export async function requireRetailer(request: NextRequest): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'retailer' && result.role !== 'admin') {
    return forbiddenResponse('Retailer access required');
  }
  return result;
}

export async function getRetailerProfile(userId: string) {
  await dbConnect();
  return Retailer.findOne({ userId });
}

export async function requireActiveRetailer(
  request: NextRequest,
  options: { write?: boolean } = {}
): Promise<{ user: AuthUser; retailer: Awaited<ReturnType<typeof getRetailerProfile>> } | NextResponse> {
  const auth = await requireRetailer(request);
  if (!isAuthUser(auth)) return auth;

  const retailer = await getRetailerProfile(auth.id);
  if (!retailer) {
    return NextResponse.json({ error: 'Retailer profile not found' }, { status: 404 });
  }

  if (retailer.status === 'suspended') {
    return forbiddenResponse('Retailer account is suspended');
  }

  if (options.write && retailer.status !== 'active') {
    return forbiddenResponse('Retailer account is not active');
  }

  return { user: auth, retailer };
}

export async function requireOwnerOrAdmin(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (result.role === 'admin') return result;
  if (result.id !== resourceUserId.toString()) {
    return forbiddenResponse();
  }
  return result;
}

export function isAuthUser(value: AuthUser | NextResponse): value is AuthUser {
  return !(value instanceof NextResponse);
}
