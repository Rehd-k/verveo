import { create } from 'zustand';
import { Campaign } from '@/types';
import { authHeaders } from '@/lib/fetchAuth';

interface CampaignStore {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  loading: boolean;
  fetchCampaigns: (userId: string) => Promise<void>;
  createCampaign: (campaign: Partial<Campaign>) => Promise<void>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  setCurrentCampaign: (campaign: Campaign | null) => void;
}
 
export const useCampaign = create<CampaignStore>((set) => ({
  campaigns: [],
  currentCampaign: null,
  loading: false,

  fetchCampaigns: async (userId: string) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/campaigns?userId=${userId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');

      const data = await res.json();
      set({ campaigns: data, loading: false });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      set({ loading: false });
    }
  },

  createCampaign: async (campaign: Partial<Campaign>) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(campaign),
      });

      if (!res.ok) throw new Error('Failed to create campaign');

      const newCampaign = await res.json();
      set((state) => ({
        campaigns: [...state.campaigns, newCampaign],
      }));
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (id: string, data: Partial<Campaign>) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update campaign');

      const updated = await res.json();
      set((state) => ({
        campaigns: state.campaigns.map((c) => (c.id === id || c._id === id ? updated : c)),
      }));
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  deleteCampaign: async (id: string) => {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to delete campaign');

    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id && c._id !== id),
      currentCampaign:
        state.currentCampaign?.id === id || state.currentCampaign?._id === id
          ? null
          : state.currentCampaign,
    }));
  },

  setCurrentCampaign: (campaign: Campaign | null) => {
    set({ currentCampaign: campaign });
  },
}));
