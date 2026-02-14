'use client';

import { useState } from 'react';
import { useCampaign } from '@/store/campaignStore';
import { useAuth } from '@/store/authStore';
import { CircleX, MoveRight, Save } from 'lucide-react';
import LocationPage from '@/components/wizard/locations';
import CTAStep from '@/components/wizard/CTAStep';
import DesignStep from '@/components/wizard/DesignStep';
import ProductStep from '@/components/wizard/ProductStep';
import ProductSelectionPage from './products/page';
import DesignStudioPage from './design/page';

export default function CampaignWizardPage() {
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

        <div className="w-full bg-background-dark border border-white/10">
            {/* Header */}


            {/* Progress */}
            {/* <div className="px-8 pt-6">
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 h-2 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
                <p className="mt-4 text-sm text-white/60">
                    Step {step} of 4
                </p>
            </div> */}

            {/* Content */}

            {step === 1 && (
                <LocationPage data={campaignData} updateData={updateData} nextStage={handleNext} />
            )}
            {step === 2 && (
                <ProductSelectionPage prevStage={handlePrev} nextStage={handleNext} data={campaignData} updateData={updateData} />
            )}
            {step === 3 && (
                // data={campaignData} updateData={updateData}
                <DesignStudioPage prevStage={handlePrev} nextStage={handleNext} data={campaignData} updateData={updateData} />
            )}
            {step === 4 && (
                <CTAStep data={campaignData} updateData={updateData} />
            )}
        </div>

    );
}
