export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getStoredToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
}

export function getRoleRedirect(role: string, redirect?: string | null): string {
  if (redirect) return redirect;
  if (role === 'admin') return '/admin';
  if (role === 'retailer') return '/retailer/dashboard';
  return '/dashboard';
}
