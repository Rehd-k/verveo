import { create } from 'zustand';
import { authHeaders } from '@/lib/fetchAuth';
import type { AdminStats, User, CampaignWithOwner, OrderWithDetails } from '@/types';
import type { PlatformAnalytics } from '@/lib/platformAnalytics';

interface AdminStore {
  stats: AdminStats | null;
  users: User[];
  usersTotal: number;
  campaigns: CampaignWithOwner[];
  campaignsTotal: number;
  orders: OrderWithDetails[];
  ordersTotal: number;
  platformAnalytics: (PlatformAnalytics & { range?: string }) | null;
  loading: boolean;
  fetchStats: () => Promise<void>;
  fetchUsers: (params?: { page?: number; search?: string; role?: string }) => Promise<void>;
  fetchCampaigns: (params?: { page?: number; status?: string; search?: string }) => Promise<void>;
  fetchOrders: (params?: { page?: number; status?: string }) => Promise<void>;
  fetchPlatformAnalytics: (range?: string) => Promise<void>;
  adminFetch: <T>(url: string, options?: RequestInit) => Promise<T>;
}

export const useAdmin = create<AdminStore>((set, get) => ({
  stats: null,
  users: [],
  usersTotal: 0,
  campaigns: [],
  campaignsTotal: 0,
  orders: [],
  ordersTotal: 0,
  platformAnalytics: null,
  loading: false,

  adminFetch: async <T>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(url, {
      ...options,
      headers: authHeaders(options?.headers as Record<string, string>),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  },

  fetchStats: async () => {
    set({ loading: true });
    try {
      const stats = await get().adminFetch<AdminStats>('/api/admin/stats');
      set({ stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchUsers: async (params = {}) => {
    set({ loading: true });
    try {
      const qs = new URLSearchParams();
      if (params.page) qs.set('page', String(params.page));
      if (params.search) qs.set('search', params.search);
      if (params.role) qs.set('role', params.role);
      const data = await get().adminFetch<{ users: User[]; total: number }>(
        `/api/admin/users?${qs}`
      );
      set({ users: data.users, usersTotal: data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCampaigns: async (params = {}) => {
    set({ loading: true });
    try {
      const qs = new URLSearchParams();
      if (params.page) qs.set('page', String(params.page));
      if (params.status) qs.set('status', params.status);
      if (params.search) qs.set('search', params.search);
      const data = await get().adminFetch<{ campaigns: CampaignWithOwner[]; total: number }>(
        `/api/admin/campaigns?${qs}`
      );
      set({ campaigns: data.campaigns, campaignsTotal: data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchOrders: async (params = {}) => {
    set({ loading: true });
    try {
      const qs = new URLSearchParams();
      if (params.page) qs.set('page', String(params.page));
      if (params.status) qs.set('status', params.status);
      const data = await get().adminFetch<{ orders: OrderWithDetails[]; total: number }>(
        `/api/admin/orders?${qs}`
      );
      set({ orders: data.orders, ordersTotal: data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchPlatformAnalytics: async (range = '7d') => {
    set({ loading: true });
    try {
      const data = await get().adminFetch<PlatformAnalytics & { range: string }>(
        `/api/admin/analytics?range=${range}`
      );
      set({ platformAnalytics: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
