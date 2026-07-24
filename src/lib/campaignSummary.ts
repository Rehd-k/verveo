import type { ProductSlug } from '@/lib/designStudio';
import { designConfigToCampaignDesign, type DesignConfigShape } from '@/lib/designStudio';

export const PRODUCT_SLUG_LABELS: Record<ProductSlug, string> = {
  cup: 'Disposable Cup',
  box: 'Food Box',
  bag: 'Paper Bag',
  'pizza-box': 'Takeaway Box',
};

export interface CampaignDataShape {
  title?: string;
  locations?: string[];
  venueTypes?: string[];
  productType?: ProductSlug;
  quantity?: number;
  design?: {
    imageUrl?: string;
    text?: string;
    colors?: string[];
  };
  ctaUrl?: string;
  qrCode?: string;
  budget?: number;
}

export interface StoreSnapshot {
  selectedProduct: {
    name: string;
    pricePerUnit: number;
  } | null;
  quantity: number;
  designConfig: DesignConfigShape;
  targetLocation: string;
  selectedBusinesses: { area: string }[];
  estimatedReach: number;
}

export interface CampaignSummary {
  title: string;
  locations: string[];
  venueTypes: string[];
  venueCount: number;
  estimatedReach: number;
  targetDistricts: string;
  productLabel: string;
  productSlug: ProductSlug;
  quantity: number;
  unitPrice: number;
  budget: number;
  designImageUrl: string;
  brandText: string;
  colors: string[];
  ctaUrl: string;
}

function resolveSlug(data: CampaignDataShape, store: StoreSnapshot): ProductSlug {
  const slug = (data.productType || store.designConfig.productType || 'box') as ProductSlug;
  if (slug === 'cup' || slug === 'box' || slug === 'bag' || slug === 'pizza-box') {
    return slug;
  }
  return 'box';
}

export function buildCampaignSummary(
  data: CampaignDataShape,
  store: StoreSnapshot
): CampaignSummary {
  const locations =
    data.locations && data.locations.length > 0
      ? data.locations
      : [...new Set(store.selectedBusinesses.map((b) => b.area))];

  const venueTypes = data.venueTypes && data.venueTypes.length > 0 ? data.venueTypes : [];

  const designFromStore = designConfigToCampaignDesign(store.designConfig);
  const designImageUrl =
    data.design?.imageUrl || store.designConfig.textureUrl || designFromStore.imageUrl || '';
  const brandText = data.design?.text || store.designConfig.brandText || '';
  const colors =
    data.design?.colors && data.design.colors.length > 0
      ? data.design.colors
      : designFromStore.colors;

  const productSlug = resolveSlug(data, store);
  const quantity = data.quantity ?? store.quantity ?? 1000;
  const unitPrice = store.selectedProduct?.pricePerUnit ?? 0;
  const budget = data.budget && data.budget > 0 ? data.budget : quantity * unitPrice;

  return {
    title: data.title || 'Untitled Campaign',
    locations,
    venueTypes,
    venueCount: store.selectedBusinesses.length,
    estimatedReach: store.estimatedReach,
    targetDistricts: store.targetLocation || locations.join(', '),
    productLabel: store.selectedProduct?.name ?? PRODUCT_SLUG_LABELS[productSlug],
    productSlug,
    quantity,
    unitPrice,
    budget,
    designImageUrl,
    brandText,
    colors,
    ctaUrl: data.ctaUrl || '',
  };
}

export function generateTrackingId(): string {
  return `adz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
