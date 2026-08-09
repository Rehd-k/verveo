import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/authCookies';

function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifySession(
  token: string,
  secret: string
): Promise<{ userId: string; role: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToBytes(signatureB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature as BufferSource,
      data
    );
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson) as {
      userId?: unknown;
      role?: unknown;
      exp?: number;
    };

    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      return null;
    }
    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') {
      return null;
    }

    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

function loginRedirect(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

  if (!token || !secret || secret === 'your-secret-key') {
    return loginRedirect(request, pathname);
  }

  const session = await verifySession(token, secret);
  if (!session) {
    const response = loginRedirect(request, pathname);
    response.cookies.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    return response;
  }

  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    const dest = session.role === 'retailer' ? '/retailer/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (
    pathname.startsWith('/retailer') &&
    session.role !== 'retailer' &&
    session.role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/retailer/:path*',
    '/dashboard/:path*',
    '/campaigns/:path*',
    '/campaign/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
};
