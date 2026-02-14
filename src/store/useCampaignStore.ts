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
interface DesignConfig {
  // Base properties
  color: string;
  logo: string | null;

  // Texture properties
  textureUrl: string | null;
  textureScale: number;
  textureRotation: number;

  // Advanced properties
  metalness: number;
  roughness: number;
  pattern: string | null;

  // Product-specific
  productType: string;

  // Text/Branding
  brandText: string;
  textColor: string;
  textSize: number;

  // Layout
  decalPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  decalScale: number;
}

interface CampaignState {
  step: number;
  selectedProduct: Product | null;
  quantity: number;
  designConfig: DesignConfig;
  setProduct: (product: Product) => void;
  setQuantity: (qty: number) => void;
  updateDesign: (config: Partial<DesignConfig>) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  step: 1,
  selectedProduct: null,
  quantity: 1000,
  designConfig: {
    color: '#ffffff',
    logo: null,
    textureUrl: null,
    textureScale: 1,
    textureRotation: 0,
    metalness: 0.1,
    roughness: 0.6,
    pattern: null,
    productType: 'box',
    brandText: '',
    textColor: '#000000',
    textSize: 1,
    decalPosition: 'center',
    decalScale: 1,
  },
  setProduct: (product) => set({ selectedProduct: product }),
  setQuantity: (qty) => set({ quantity: qty }),
  updateDesign: (config) =>
    set((state) => ({ designConfig: { ...state.designConfig, ...config } })),
}));