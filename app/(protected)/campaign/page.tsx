'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCampaign } from '@/store/campaignStore';
import { useAuth } from '@/store/authStore';
import { useCampaignStore } from '@/store/useCampaignStore';
import {
  campaignDesignToDesignConfig,
  designConfigToCampaignDesign,
  PRODUCT_SLUG_TO_NAME,
  type ProductSlug,
} from '@/lib/designStudio';
import type { CampaignDataShape } from '@/lib/campaignSummary';
import { authHeaders } from '@/lib/fetchAuth';
import CTAStep from '@/components/wizard/CTAStep';
import ProductSelectionPage from './products/page';
import DesignStudioPage from './design/page';
import LocationPage from './location/page';

const PRODUCT_CATALOG = [
  {
    id: '1',
    name: 'Disposable Cup',
    specs: '12oz • Double Wall',
    eco: 'biodegradable',
    dimensions: '10" x 5" x 14"',
    image: '/assets/cup.png',
    link: '120gsm Kraft',
    pricePerUnit: 400,
  },
  {
    id: '2',
    name: 'Food Box',
    specs: 'Recyclable Cardboard',
    eco: 'biodegradable',
    dimensions: '10" x 5" x 14"',
    image: '/assets/box.png',
    link: '120gsm Kraft',
    pricePerUnit: 450,
  },
  {
    id: '3',
    name: 'Paper Bag',
    specs: 'Kraft • Reinforced',
    eco: 'biodegradable',
    dimensions: '10" x 5" x 14"',
    image: '/assets/bag.png',
    link: '120gsm Kraft',
    pricePerUnit: 200,
  },
  {
    id: '4',
    name: 'Takeaway Box',
    eco: 'Not Eco Friendly',
    dimensions: '10" x 5" x 14"',
    specs: 'Kraft • Plastic',
    image: '/assets/takeaway.jpg',
    link: '120gsm Kraft',
    pricePerUnit: 490,
  },
];

function isProductSlug(value: string): value is ProductSlug {
  return value === 'cup' || value === 'box' || value === 'bag' || value === 'pizza-box';
}

export default function CampaignWizardPage() {
  const searchParams = useSearchParams();
  const area = searchParams.get('area');
  const longitude = searchParams.get('long');
  const latitude = searchParams.get('lat');
  const editingCampaignId = searchParams.get('campaignId');
  const { selectedBusinesses, designConfig, setProduct, setQuantity, updateDesign } =
    useCampaignStore();
  const { user } = useAuth();
  const router = useRouter();
  const { createCampaign, updateCampaign } = useCampaign();
  const [step, setStep] = useState(1);
  const [hydrating, setHydrating] = useState(!!editingCampaignId);
  const [hydrateError, setHydrateError] = useState<string | null>(null);

  const [campaignData, setCampaignData] = useState({
    title: '',
    locations: [] as string[],
    venueTypes: [] as string[],
    productType: 'box' as 'cup' | 'box' | 'bag' | 'pizza-box',
    quantity: 1000,
    design: {
      imageUrl: '',
      text: '',
      colors: [] as string[],
      handoff: 'self' as 'self' | 'verveo_team',
    },
    ctaUrl: '',
    qrCode: '',
    budget: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editingCampaignId) {
      setHydrating(false);
      return;
    }

    let cancelled = false;
    setHydrating(true);
    setHydrateError(null);

    (async () => {
      try {
        const res = await fetch(`/api/campaigns/${editingCampaignId}`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load campaign');
        }
        if (cancelled) return;

        const rawProductType =
          typeof data.productType === 'string' ? data.productType : '';
        const productType: ProductSlug = isProductSlug(rawProductType)
          ? rawProductType
          : 'box';
        const design = {
          imageUrl: data.design?.imageUrl || '',
          text: data.design?.text || '',
          colors: Array.isArray(data.design?.colors) ? data.design.colors : [],
          handoff: (data.design?.handoff === 'verveo_team' ? 'verveo_team' : 'self') as
            | 'self'
            | 'verveo_team',
        };

        setCampaignData({
          title: data.title || '',
          locations: Array.isArray(data.locations) ? data.locations : [],
          venueTypes: Array.isArray(data.venueTypes) ? data.venueTypes : [],
          productType,
          quantity: Number(data.quantity) || 1000,
          design,
          ctaUrl: data.ctaUrl || '',
          qrCode: data.qrCode || '',
          budget: Number(data.budget) || 0,
        });

        const productName = PRODUCT_SLUG_TO_NAME[productType];
        const catalogProduct = PRODUCT_CATALOG.find((p) => p.name === productName);
        if (catalogProduct) {
          setProduct(catalogProduct);
        }
        setQuantity(Number(data.quantity) || 1000);
        updateDesign(campaignDesignToDesignConfig(design, productType));
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setHydrateError(error instanceof Error ? error.message : 'Failed to load campaign');
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editingCampaignId, setProduct, setQuantity, updateDesign]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user || hydrating) return;
    setLoading(true);
    try {
      const locationNames =
        campaignData.locations.length > 0
          ? campaignData.locations
          : [...new Set(selectedBusinesses.map((b: { area: string }) => b.area))];

      const payload = {
        ...campaignData,
        locations: locationNames,
        venueTypes: campaignData.venueTypes.length > 0 ? campaignData.venueTypes : [],
        design: campaignData.design.imageUrl
          ? campaignData.design
          : designConfigToCampaignDesign(designConfig),
        productType: (campaignData.productType ||
          designConfig.productType) as 'cup' | 'box' | 'bag' | 'pizza-box',
        qrCode: campaignData.qrCode || undefined,
        title: campaignData.title || 'Untitled Campaign',
        status: 'draft' as const,
      };

      if (editingCampaignId) {
        await updateCampaign(editingCampaignId, payload);
      } else {
        await createCampaign({
          ...payload,
          userId: user.id,
        });
      }
      router.push('/campaigns');
    } catch (error) {
      console.error('Failed to save campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateData = useCallback((newData: Partial<CampaignDataShape>) => {
    setCampaignData((prev) => {
      const nextLocations = newData.locations ?? prev.locations;
      const nextVenueTypes = newData.venueTypes ?? prev.venueTypes;
      const locationsUnchanged =
        newData.locations === undefined ||
        (nextLocations.length === prev.locations.length &&
          nextLocations.every((v, i) => v === prev.locations[i]));
      const venueTypesUnchanged =
        newData.venueTypes === undefined ||
        (nextVenueTypes.length === prev.venueTypes.length &&
          nextVenueTypes.every((v, i) => v === prev.venueTypes[i]));

      const next = {
        ...prev,
        ...newData,
        locations: locationsUnchanged ? prev.locations : nextLocations,
        venueTypes: venueTypesUnchanged ? prev.venueTypes : nextVenueTypes,
        productType: (newData.productType as typeof prev.productType) ?? prev.productType,
        design: newData.design ? { ...prev.design, ...newData.design } : prev.design,
      };

      const onlyLocationFields =
        Object.keys(newData).every((key) => key === 'locations' || key === 'venueTypes');
      if (onlyLocationFields && locationsUnchanged && venueTypesUnchanged) {
        return prev;
      }

      return next;
    });
  }, []);

  const initialCenter =
    latitude && longitude ? ([Number(longitude), Number(latitude)] as [number, number]) : undefined;

  if (hydrating) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading campaign draft...
      </div>
    );
  }

  if (hydrateError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-destructive">{hydrateError}</p>
        <button
          type="button"
          onClick={() => router.push('/campaigns')}
          className="rounded-lg border border-border px-4 py-2 text-sm text-foreground"
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  return (
    <div className={step === 3 ? 'w-full min-w-0' : 'w-full min-w-0 border border-border bg-background'}>
      {step === 1 && (
        <LocationPage
          data={campaignData}
          updateData={updateData}
          nextStage={handleNext}
          initialDistrict={area || undefined}
          initialCenter={initialCenter}
        />
      )}
      {step === 2 && (
        <ProductSelectionPage
          prevStage={handlePrev}
          nextStage={handleNext}
          data={campaignData}
          updateData={updateData}
        />
      )}
      {step === 3 && (
        <DesignStudioPage
          prevStage={handlePrev}
          nextStage={handleNext}
          data={campaignData}
          updateData={updateData}
          campaignId={editingCampaignId}
        />
      )}
      {step === 4 && (
        <CTAStep
          data={campaignData}
          updateData={updateData}
          prevStage={handlePrev}
          onSubmit={handleSubmit}
          loading={loading}
          variant="fullPage"
        />
      )}
    </div>
  );
}
