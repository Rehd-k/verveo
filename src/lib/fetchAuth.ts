/** Client helpers for authenticated same-origin fetches (HttpOnly cookie). */

export function authHeaders(extra?: HeadersInit): HeadersInit {
  return {
    ...(extra || {}),
  };
}

export function getRoleRedirect(role: string, redirect?: string | null): string {
  if (redirect) return redirect;
  if (role === 'admin') return '/admin';
  if (role === 'retailer') return '/retailer/dashboard';
  return '/dashboard';
}
