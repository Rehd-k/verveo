import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  specs: string;
  eco: string;
  dimensions: string;
  image: string;
  link: string;
};
interface CampaignState {
  step: number;
  selectedProduct: Product | null;
  quantity: number;
  designConfig: {
    color: string;
    logo: string | null;
  };
  setProduct: (product: Product) => void;
  setQuantity: (qty: number) => void;
  updateDesign: (config: Partial<CampaignState['designConfig']>) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  step: 1,
  selectedProduct: null,
  quantity: 1000,
  designConfig: { color: '#ffffff', logo: null },
  setProduct: (product) => set({ selectedProduct: product }),
  setQuantity: (qty) => set({ quantity: qty }),
  updateDesign: (config) =>
    set((state) => ({ designConfig: { ...state.designConfig, ...config } })),
}));