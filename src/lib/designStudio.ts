import * as THREE from 'three';

export type ProductSlug = 'cup' | 'box' | 'bag' | 'pizza-box';

export const PRODUCT_NAME_TO_SLUG: Record<string, ProductSlug> = {
  'Disposable Cup': 'cup',
  'Food Box': 'box',
  'Paper Bag': 'bag',
  'Takeaway Box': 'pizza-box',
};

export const PRODUCT_SLUG_TO_NAME: Record<ProductSlug, string> = {
  cup: 'Disposable Cup',
  box: 'Food Box',
  bag: 'Paper Bag',
  'pizza-box': 'Takeaway Box',
};

export interface CampaignDesignShape {
  imageUrl?: string;
  text?: string;
  colors?: string[];
}

export function campaignDesignToDesignConfig(
  design: CampaignDesignShape | undefined,
  productType: string
): Partial<DesignConfigShape> {
  const colors = design?.colors ?? [];
  return {
    textureUrl: design?.imageUrl || null,
    brandText: design?.text || '',
    color: colors[0] || '#ffffff',
    textColor: colors[1] || '#000000',
    productType: productType || 'box',
  };
}

export interface DesignConfigShape {
  textureUrl: string | null;
  textureScale: number;
  textureRotation: number;
  color: string;
  textColor: string;
  brandText: string;
  metalness: number;
  roughness: number;
  productType: string;
}

export function resolveProductSlug(
  selectedProductName: string | undefined,
  designProductType: string
): ProductSlug {
  if (selectedProductName && PRODUCT_NAME_TO_SLUG[selectedProductName]) {
    return PRODUCT_NAME_TO_SLUG[selectedProductName];
  }
  const slug = designProductType as ProductSlug;
  if (slug === 'cup' || slug === 'box' || slug === 'bag' || slug === 'pizza-box') {
    return slug;
  }
  return 'box';
}

export function configureTexture(
  tex: THREE.Texture,
  opts: { scale: number; rotation: number; productSlug: ProductSlug }
) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;

  const { scale, rotation, productSlug } = opts;
  switch (productSlug) {
    case 'cup':
      tex.repeat.set(2 * scale, 1 * scale);
      break;
    case 'bag':
      tex.repeat.set(1 * scale, 1.6 * scale);
      break;
    case 'pizza-box':
      tex.repeat.set(1.4 * scale, 1.4 * scale);
      break;
    default:
      tex.repeat.set(1 * scale, 1 * scale);
  }

  tex.rotation = rotation;
  tex.center.set(0.5, 0.5);
  tex.needsUpdate = true;
}

export function designConfigToCampaignDesign(designConfig: DesignConfigShape) {
  return {
    imageUrl: designConfig.textureUrl ?? '',
    text: designConfig.brandText,
    colors: [designConfig.color, designConfig.textColor],
  };
}
