import { NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'token';
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

function cookieSecure(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Build Set-Cookie value for the session token (HttpOnly). */
export function buildAuthCookie(token: string): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (cookieSecure()) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearAuthCookie(): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (cookieSecure()) parts.push('Secure');
  return parts.join('; ');
}

export function withAuthCookie<T>(response: NextResponse<T>, token: string): NextResponse<T> {
  response.headers.append('Set-Cookie', buildAuthCookie(token));
  return response;
}

export function withClearedAuthCookie<T>(response: NextResponse<T>): NextResponse<T> {
  response.headers.append('Set-Cookie', buildClearAuthCookie());
  return response;
}
