'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaign } from '@/store/campaignStore';
import { useAuth } from '@/store/authStore';
import { useSearchParams } from 'next/navigation';
import { useCampaignStore } from '@/store/useCampaignStore';
import { designConfigToCampaignDesign } from '@/lib/designStudio';
import type { CampaignDataShape } from '@/lib/campaignSummary';
import CTAStep from '@/components/wizard/CTAStep';
import ProductSelectionPage from './products/page';
import DesignStudioPage from './design/page';
import LocationPage from './location/page';

export default function CampaignWizardPage() {
  const searchParams = useSearchParams();
  const area = searchParams.get('area');
  const longitude = searchParams.get('long');
  const latitude = searchParams.get('lat');
  const { selectedBusinesses, designConfig } = useCampaignStore();
  const { user } = useAuth();
  const router = useRouter();
  const { createCampaign } = useCampaign();
  const [step, setStep] = useState(1);

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
    },
    ctaUrl: '',
    qrCode: '',
    budget: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const locationNames =
        campaignData.locations.length > 0
          ? campaignData.locations
          : [...new Set(selectedBusinesses.map((b: { area: string }) => b.area))];

      await createCampaign({
        ...campaignData,
        locations: locationNames,
        venueTypes:
          campaignData.venueTypes.length > 0
            ? campaignData.venueTypes
            : [],
        design: campaignData.design.imageUrl
          ? campaignData.design
          : designConfigToCampaignDesign(designConfig),
        productType: (campaignData.productType ||
          designConfig.productType) as 'cup' | 'box' | 'bag' | 'pizza-box',
        qrCode: campaignData.qrCode || undefined,
        title: campaignData.title || 'Untitled Campaign',
        userId: user.id,
        status: 'draft',
      });
      router.push('/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateData = useCallback((newData: Partial<CampaignDataShape>) => {
    setCampaignData((prev) => ({
      ...prev,
      ...newData,
      productType: (newData.productType as typeof prev.productType) ?? prev.productType,
      design: newData.design ? { ...prev.design, ...newData.design } : prev.design,
    }));
  }, []);

  const initialCenter =
    latitude && longitude ? ([Number(longitude), Number(latitude)] as [number, number]) : undefined;

  return (
    <div className="w-full bg-background-dark border border-white/10">
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
