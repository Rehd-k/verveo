'use client';

import { useState } from 'react';
import PackagingCanvas from '@/components/features/studio/PackagingCanvas';
import { UploadPanel } from '@/components/features/studio/UploadPanel';
import { useCampaignStore } from '@/store/useCampaignStore';
import { designConfigToCampaignDesign, type ProductSlug } from '@/lib/designStudio';
import { ArrowLeft, BadgeCheck, ChevronDown, Info, Settings2, X } from 'lucide-react';

interface DesignStepProps {
  data: {
    productType: ProductSlug;
    design: { imageUrl: string; text: string; colors: string[] };
  };
  updateData: (data: Partial<{
    productType: ProductSlug;
    design: { imageUrl: string; text: string; colors: string[] };
  }>) => void;
  nextStage: () => void;
  prevStage: () => void;
}

function DesignStatsPanel({ compact = false }: { compact?: boolean }) {
  const { designConfig, selectedProduct } = useCampaignStore();

  return (
    <div className={`space-y-2 ${compact ? 'text-[11px]' : ''}`}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Info className="size-4" />
        Design Stats
      </h3>
      <div className="text-xs text-text-dim space-y-1">
        <div className="flex justify-between gap-2">
          <span>Product:</span>
          <span className="text-primary font-medium truncate">
            {(selectedProduct?.name ?? designConfig.productType).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Color:</span>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-border-dark shrink-0"
              style={{ backgroundColor: designConfig.color }}
            />
            <span className="text-primary font-medium truncate">{designConfig.color}</span>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span>Texture:</span>
          <span className="text-primary font-medium">
            {designConfig.textureUrl ? 'Applied' : 'None'}
          </span>
        </div>
        {designConfig.textureUrl && (
          <div className="mt-2 rounded border border-border-dark overflow-hidden">
            <img
              src={designConfig.textureUrl}
              alt="Texture preview"
              className="w-full h-16 object-cover"
            />
          </div>
        )}
        <div className="flex justify-between">
          <span>Metalness:</span>
          <span className="text-primary font-medium">{(designConfig.metalness * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Roughness:</span>
          <span className="text-primary font-medium">{(designConfig.roughness * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function DesignStudioPage({ prevStage, nextStage, updateData }: DesignStepProps) {
  const { designConfig } = useCampaignStore();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const handleConfirmDesign = () => {
    updateData({
      productType: designConfig.productType as ProductSlug,
      design: designConfigToCampaignDesign(designConfig),
    });
    nextStage();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-3.5rem)] lg:h-[91.5vh] w-full bg-[#0f0d0a]">
      {/* Desktop side panel */}
      <div className="hidden lg:flex w-96 border-r overflow-hidden flex-col shrink-0">
        <UploadPanel name={designConfig.productType} />
      </div>

      <main className="flex-1 relative overflow-hidden min-h-[50vh]">
        <PackagingCanvas />

        {/* Mobile stats toggle */}
        <button
          type="button"
          onClick={() => setStatsOpen((prev) => !prev)}
          className="lg:hidden absolute top-3 right-3 z-20 flex items-center gap-1 rounded-lg bg-surface-dark/90 backdrop-blur border border-border-dark px-3 py-2 text-xs font-medium text-white"
        >
          <Info className="size-3.5" />
          Stats
        </button>

        {/* Stats overlay */}
        <div
          className={`absolute z-20 bg-surface-dark/90 backdrop-blur border border-border-dark rounded-xl p-4 ${
            statsOpen
              ? 'top-14 left-3 right-3 lg:top-6 lg:right-6 lg:left-auto lg:max-w-xs'
              : 'hidden lg:block top-6 right-6 max-w-xs'
          }`}
        >
          {statsOpen && (
            <button
              type="button"
              onClick={() => setStatsOpen(false)}
              className="absolute top-2 right-2 rounded p-1 text-text-dim hover:text-white lg:hidden"
              aria-label="Close stats"
            >
              <X className="size-4" />
            </button>
          )}
          <DesignStatsPanel compact={statsOpen} />
        </div>

        {/* Mobile controls toggle */}
        <button
          type="button"
          onClick={() => setControlsOpen(true)}
          className="lg:hidden absolute bottom-24 left-4 z-20 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-black shadow-lg"
        >
          <Settings2 className="size-4" />
          Controls
        </button>

        {/* Mobile bottom sheet */}
        {controlsOpen && (
          <>
            <button
              type="button"
              className="lg:hidden fixed inset-0 z-30 bg-black/60"
              onClick={() => setControlsOpen(false)}
              aria-label="Close controls overlay"
            />
            <section className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex max-h-[75vh] flex-col rounded-t-2xl border-t border-border-dark bg-[#0f0d0a]">
              <div className="flex items-center justify-between border-b border-border-dark px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                    Design Studio
                  </p>
                  <p className="text-sm font-bold text-white">Upload &amp; Customize</p>
                </div>
                <button
                  type="button"
                  onClick={() => setControlsOpen(false)}
                  className="rounded-lg p-2 text-text-dim hover:bg-white/5 hover:text-white"
                  aria-label="Close controls"
                >
                  <ChevronDown className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <UploadPanel name={designConfig.productType} />
              </div>
            </section>
          </>
        )}

        <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 px-4 sm:gap-4">
          <button
            onClick={prevStage}
            className="flex-1 sm:flex-none px-6 py-3 bg-surface-dark/90 backdrop-blur border border-border-dark hover:border-primary rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-primary/90 text-black rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/50"
            onClick={handleConfirmDesign}
          >
            <BadgeCheck className="size-4" />
            Confirm Design
          </button>
        </div>
      </main>
    </div>
  );
}
