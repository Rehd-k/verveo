import { create } from 'zustand';
import { authHeaders } from '@/lib/fetchAuth';
import type { Campaign, Proof, Retailer, StockOrder, User } from '@/types';

interface StockSummary {
  allowance: number;
  currentStock: number;
  usedStock: number;
}

interface RetailerStore {
  profile: Retailer | null;
  user: Pick<User, 'id' | 'email' | 'name'> | null;
  stock: StockSummary | null;
  orders: StockOrder[];
  campaigns: Campaign[];
  proofs: Proof[];
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<boolean>;
  fetchStock: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  fetchProofs: () => Promise<void>;
  refreshAll: () => Promise<void>;
  submitOnboarding: (data: {
    businessName: string;
    venueType: string;
    city: string;
    address?: string;
    lat?: number;
    lng?: number;
  }) => Promise<void>;
  updateProfile: (data: Partial<Pick<Retailer, 'businessName' | 'venueType' | 'city' | 'address' | 'location'>>) => Promise<void>;
  requestStock: (quantity: number, notes?: string) => Promise<void>;
}

export const useRetailer = create<RetailerStore>((set, get) => ({
  profile: null,
  user: null,
  stock: null,
  orders: [],
  campaigns: [],
  proofs: [],
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/retailer/me', { headers: authHeaders() });
      if (res.status === 404) {
        set({ profile: null, user: null, loading: false });
        return false;
      }
      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      set({
        profile: data.retailer,
        user: data.user
          ? { id: data.user.id, email: data.user.email, name: data.user.name }
          : null,
        loading: false,
      });
      return true;
    } catch (error) {
      console.error('Error fetching retailer profile:', error);
      set({ loading: false, error: 'Failed to load profile' });
      return false;
    }
  },

  fetchStock: async () => {
    try {
      const res = await fetch('/api/retailer/stock', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch stock');

      const data = await res.json();
      set({
        stock: data.stock,
        orders: data.orders || [],
      });
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  },

  fetchOrders: async () => {
    try {
      const res = await fetch('/api/retailer/stock/orders', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch orders');

      const data = await res.json();
      set({ orders: data.orders || [] });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  },

  fetchCampaigns: async () => {
    try {
      const res = await fetch('/api/retailer/campaigns', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch campaigns');

      const data = await res.json();
      set({ campaigns: data.campaigns || [] });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  },

  fetchProofs: async () => {
    try {
      const res = await fetch('/api/retailer/proofs', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch proofs');

      const data = await res.json();
      set({ proofs: data.proofs || [] });
    } catch (error) {
      console.error('Error fetching proofs:', error);
    }
  },

  refreshAll: async () => {
    set({ loading: true });
    const hasProfile = await get().fetchProfile();
    if (hasProfile) {
      await Promise.all([
        get().fetchStock(),
        get().fetchCampaigns(),
        get().fetchProofs(),
      ]);
    }
    set({ loading: false });
  },

  submitOnboarding: async (data) => {
    const res = await fetch('/api/retailer/onboarding', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Onboarding failed');
    }

    const result = await res.json();
    set({ profile: result.retailer });
  },

  updateProfile: async (data) => {
    const res = await fetch('/api/retailer/me', {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to update profile');

    const result = await res.json();
    set({ profile: result.retailer });
  },

  requestStock: async (quantity, notes) => {
    const res = await fetch('/api/retailer/stock/orders', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ quantity, notes }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to request stock');
    }

    await get().fetchOrders();
    await get().fetchStock();
  },
}));
