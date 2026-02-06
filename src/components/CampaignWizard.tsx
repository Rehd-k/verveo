'use client';

import { useState } from 'react';
import { useCampaign } from '@/store/campaignStore';
import { useAuth } from '@/store/authStore';
import LocationStep from './wizard/LocationStep';
import ProductStep from './wizard/ProductStep';
import DesignStep from './wizard/DesignStep';
import CTAStep from './wizard/CTAStep';

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

    console.log('Submitting campaign with data:', campaignData);
    setLoading(true);
    try {
      await createCampaign({
        ...campaignData,
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

  const updateData = (newData: Partial<typeof campaignData>) => {
    setCampaignData({ ...campaignData, ...newData });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-scroll">
      <div className="w-full max-w-2xl rounded-2xl bg-background-dark border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Create Campaign</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress */}
        <div className="px-8 pt-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-primary' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-white/60">
            Step {step} of 4
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 min-h-96">
          {step === 1 && (
            <LocationStep data={campaignData} updateData={updateData} />
          )}
          {step === 2 && (
            <ProductStep data={campaignData} updateData={updateData} />
          )}
          {step === 3 && (
            <DesignStep data={campaignData} updateData={updateData} />
          )}
          {step === 4 && (
            <CTAStep data={campaignData} updateData={updateData} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-8 py-6 flex gap-4 justify-end">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 transition-all"
          >
            Previous
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg bg-primary text-background-dark font-bold hover:brightness-110 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-primary text-background-dark font-bold hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
