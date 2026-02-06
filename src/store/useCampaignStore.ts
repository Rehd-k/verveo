import { create } from 'zustand';

interface CampaignState {
  step: number;
  selectedProduct: string | null;
  quantity: number;
  designConfig: {
    color: string;
    logo: string | null;
  };
  setProduct: (id: string) => void;
  setQuantity: (qty: number) => void;
  updateDesign: (config: Partial<CampaignState['designConfig']>) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  step: 1,
  selectedProduct: null,
  quantity: 1000,
  designConfig: { color: '#ffffff', logo: null },
  setProduct: (id) => set({ selectedProduct: id }),
  setQuantity: (qty) => set({ quantity: qty }),
  updateDesign: (config) => 
    set((state) => ({ designConfig: { ...state.designConfig, ...config } })),
}));