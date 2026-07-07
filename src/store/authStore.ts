import { create } from 'zustand';
import { User } from '@/types';
import { setAuthCookie, clearAuthCookie } from '@/lib/fetchAuth';

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, role?: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null, token?: string) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  initializeAuth: async () => {
    if (get().initialized) return;

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      set({ initialized: true });
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (!res.ok) {
        localStorage.removeItem('token');
        clearAuthCookie();
        set({ user: null, token: null, loading: false, initialized: true });
        return;
      }

      const data = await res.json();
      const token = data.token ?? storedToken;
      setAuthCookie(token);
      set({
        user: data.user,
        token,
        loading: false,
        initialized: true,
      });
    } catch {
      localStorage.removeItem('token');
      clearAuthCookie();
      set({ user: null, token: null, loading: false, initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setAuthCookie(data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string, role = 'advertiser') => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      setAuthCookie(data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    clearAuthCookie();
    set({ user: null, token: null });
  },

  setUser: (user: User | null, token?: string) => {
    if (token) setAuthCookie(token);
    set({ user, token: token || null });
  },
}));
