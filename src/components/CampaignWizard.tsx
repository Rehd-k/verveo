'use client';

import { useState, useCallback } from 'react';
import { useCampaign } from '@/store/campaignStore';
import { useAuth } from '@/store/authStore';
import ProductStep from './wizard/ProductStep';
import DesignStep from './wizard/DesignStep';
import CTAStep from './wizard/CTAStep';
import type { CampaignDataShape } from '@/lib/campaignSummary';
import { CircleX, Save } from 'lucide-react';

export default function CampaignWizard({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
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
      await createCampaign({
        ...campaignData,
        qrCode: campaignData.qrCode || undefined,
        title: campaignData.title || 'Untitled Campaign',
        userId: user.id,
        status: 'draft',
      });
      onClose();
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

  return (

    <div className="w-full rounded-2xl bg-background border border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-8 py-6">
        <h2 className="text-2xl font-bold text-foreground">Create Campaign</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <CircleX className="size-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-8 pt-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-card/10'
                }`}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Step {step} of 4
        </p>
      </div>

      {/* Content */}
      <div className="px-8 py-6 min-h-96">
        {step === 1 && (
          // <LocationPage data={campaignData} updateData={updateData} nextStage={handleNext} />
          <></>
        )}
        {step === 2 && (
          <ProductStep data={campaignData} updateData={updateData} />
        )}
        {step === 3 && (
          <DesignStep data={campaignData} updateData={updateData} />
        )}
        {step === 4 && (
          <CTAStep
            data={campaignData}
            updateData={updateData}
            onSubmit={handleSubmit}
            loading={loading}
            variant="embedded"
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-8 py-6 flex gap-4 justify-end">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-accent disabled:opacity-50 transition-all"
        >
          Previous
        </button>
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !campaignData.ctaUrl?.trim()}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        )}
      </div>
    </div>

  );
}
