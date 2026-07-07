import { create } from 'zustand';
import { PRODUCT_NAME_TO_SLUG } from '@/lib/designStudio';

interface Product {
  id: string;
  name: string;
  specs: string;
  eco: string;
  dimensions: string;
  image: string;
  link: string;
  pricePerUnit: number
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
  targetLocation: string;
  selectedBusinesses: any[];
  estimatedReach: number;
  setProduct: (product: Product) => void;
  setQuantity: (qty: number) => void;
  updateDesign: (config: Partial<DesignConfig>) => void;
  setTargetLocation: (location: string) => void;
  setSelectedBusinesses: (businesses: any[]) => void;
  setEstimatedReach: (reach: number) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  step: 1,
  selectedProduct: null,
  quantity: 1000,
  targetLocation: '',
  selectedBusinesses: [],
  estimatedReach: 0,
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
  setProduct: (product) =>
    set((state) => ({
      selectedProduct: product,
      designConfig: {
        ...state.designConfig,
        productType: PRODUCT_NAME_TO_SLUG[product.name] ?? 'box',
      },
    })),
  setQuantity: (qty) => set({ quantity: qty }),
  setTargetLocation: (location: string) => set({ targetLocation: location }),
  setSelectedBusinesses: (businesses: any[]) => set({ selectedBusinesses: businesses }),
  setEstimatedReach: (reach: number) => set({ estimatedReach: reach }),
  updateDesign: (config) =>
    set((state) => ({ designConfig: { ...state.designConfig, ...config } })),
})); 