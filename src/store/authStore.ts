import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initializeAuth: async () => {
    if (get().initialized) return;

    set({ loading: true });
    try {
      // Clear legacy client-stored tokens (pre-HttpOnly migration)
      try {
        localStorage.removeItem('token');
      } catch {
        // ignore
      }

      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });

      if (!res.ok) {
        set({ user: null, loading: false, initialized: true });
        return;
      }

      const data = await res.json();
      set({
        user: data.user,
        loading: false,
        initialized: true,
      });
    } catch {
      set({ user: null, loading: false, initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      try {
        localStorage.removeItem('token');
      } catch {
        // ignore
      }

      set({ user: data.user, loading: false });
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
        credentials: 'same-origin',
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      try {
        localStorage.removeItem('token');
      } catch {
        // ignore
      }

      set({ user: data.user, loading: false });
      return data.user;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('token');
    } catch {
      // ignore
    }
    set({ user: null });
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
