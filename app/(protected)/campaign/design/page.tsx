'use client';

import { useState } from 'react';
import PackagingCanvas from '@/components/features/studio/PackagingCanvas';
import { UploadPanel } from '@/components/features/studio/UploadPanel';
import {
  DesignModeChoice,
  ProDesignBookingForm,
} from '@/components/features/studio/ProDesignBooking';
import { useCampaignStore } from '@/store/useCampaignStore';
import { designConfigToCampaignDesign, type ProductSlug } from '@/lib/designStudio';
import { ArrowLeft, BadgeCheck, ChevronDown, Info, Settings2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DesignStepProps {
  data: {
    productType: ProductSlug;
    design: {
      imageUrl: string;
      text: string;
      colors: string[];
      handoff?: 'self' | 'verveo_team';
    };
  };
  updateData: (data: Partial<{
    productType: ProductSlug;
    design: {
      imageUrl: string;
      text: string;
      colors: string[];
      handoff?: 'self' | 'verveo_team';
    };
  }>) => void;
  nextStage: () => void;
  prevStage: () => void;
  campaignId?: string | null;
}

function DesignStatsPanel({ compact = false }: { compact?: boolean }) {
  const { designConfig, selectedProduct } = useCampaignStore();

  return (
    <div className={cn('space-y-2', compact && 'text-[11px]')}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Info className="size-4 shrink-0" />
        Design Stats
      </h3>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between gap-2">
          <span>Product:</span>
          <span className="truncate font-medium text-primary">
            {(selectedProduct?.name ?? designConfig.productType).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Color:</span>
          <div className="flex items-center gap-2">
            <div
              className="size-4 shrink-0 rounded border border-border"
              style={{ backgroundColor: designConfig.color }}
            />
            <span className="truncate font-medium text-primary">{designConfig.color}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Texture:</span>
          <span className="font-medium text-primary">
            {designConfig.textureUrl ? 'Applied' : 'None'}
          </span>
        </div>
        {designConfig.textureUrl && (
          <div className="mt-2 overflow-hidden rounded border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={designConfig.textureUrl}
              alt="Texture preview"
              className="h-16 w-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-between">
          <span>Metalness:</span>
          <span className="font-medium text-primary">
            {(designConfig.metalness * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Roughness:</span>
          <span className="font-medium text-primary">
            {(designConfig.roughness * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

type DesignMode = 'choice' | 'diy' | 'pro' | 'pro_done';

export default function DesignStudioPage({
  prevStage,
  nextStage,
  updateData,
  data,
  campaignId,
}: DesignStepProps) {
  const { designConfig } = useCampaignStore();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [mode, setMode] = useState<DesignMode>(
    data.design?.handoff === 'verveo_team' ? 'pro_done' : 'choice'
  );

  const handleConfirmDesign = () => {
    updateData({
      productType: designConfig.productType as ProductSlug,
      design: {
        ...designConfigToCampaignDesign(designConfig),
        handoff: 'self',
      },
    });
    nextStage();
  };

  const handleProBooked = () => {
    updateData({
      design: {
        ...(data.design || { imageUrl: '', text: '', colors: [] }),
        handoff: 'verveo_team',
      },
    });
    setMode('pro_done');
  };

  if (mode === 'choice') {
    return (
      <div className="-m-4 flex min-h-[calc(100dvh-3.25rem)] flex-col bg-background md:-m-6">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={prevStage}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-accent"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>
        <DesignModeChoice
          onChooseDiy={() => setMode('diy')}
          onChoosePro={() => setMode('pro')}
        />
      </div>
    );
  }

  if (mode === 'pro' || mode === 'pro_done') {
    return (
      <div className="-m-4 flex min-h-[calc(100dvh-3.25rem)] flex-col bg-background md:-m-6">
        {mode === 'pro' ? (
          <ProDesignBookingForm
            campaignId={campaignId}
            onBooked={handleProBooked}
            onBackToChoice={() => setMode('choice')}
          />
        ) : (
          <div className="mx-auto flex h-full w-full max-w-lg flex-col justify-center gap-4 p-8 text-center">
            <BadgeCheck className="mx-auto size-12 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Pro design booked</h2>
            <p className="text-sm text-muted-foreground">
              The Verveo design team will contact you at your chosen time. You can continue setting up
              your campaign CTA while they prepare the container design.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setMode('choice')}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Change design option
              </button>
              <button
                type="button"
                onClick={nextStage}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Continue to CTA
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        '-m-4 flex min-h-0 flex-col bg-background md:-m-6',
        'h-[calc(100dvh-3.25rem)] lg:h-[calc(100dvh-3.25rem)] lg:flex-row'
      )}
    >
      <aside className="hidden h-full w-96 shrink-0 flex-col overflow-hidden border-r border-border lg:flex">
        <div className="shrink-0 border-b border-border p-3">
          <button
            type="button"
            onClick={() => setMode('choice')}
            className="w-full rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-primary/15"
          >
            Prefer Verveo Pro designers? Switch →
          </button>
        </div>
        <UploadPanel name={designConfig.productType} />
      </aside>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-0 flex-1 pb-19 lg:pb-0">
          <PackagingCanvas mobileChrome />

          <button
            type="button"
            onClick={() => setStatsOpen((prev) => !prev)}
            className="absolute right-3 top-3 z-20 flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-popover px-3 py-2 text-xs font-medium text-foreground shadow-lg lg:hidden"
            aria-expanded={statsOpen}
          >
            <Info className="size-3.5" />
            Stats
          </button>

          <div
            className={cn(
              'absolute z-20 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl',
              statsOpen
                ? 'inset-x-3 top-14 lg:inset-x-auto lg:right-6 lg:top-6 lg:max-w-xs'
                : 'hidden lg:block lg:right-6 lg:top-6 lg:max-w-xs'
            )}
          >
            {statsOpen && (
              <button
                type="button"
                onClick={() => setStatsOpen(false)}
                className="absolute right-2 top-2 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
                aria-label="Close stats"
              >
                <X className="size-4" />
              </button>
            )}
            <DesignStatsPanel compact={statsOpen} />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 border-t border-border bg-popover p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] lg:static lg:z-20 lg:border-0 lg:bg-transparent lg:p-0 lg:pb-0 lg:shadow-none">
          <div className="flex items-center gap-2 lg:absolute lg:inset-x-0 lg:bottom-4 lg:justify-center lg:px-4 lg:gap-4">
            <button
              type="button"
              onClick={() => setControlsOpen(true)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary-foreground lg:hidden"
            >
              <Settings2 className="size-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={prevStage}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent sm:flex-none sm:px-6 lg:shadow-lg"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmDesign}
              className="inline-flex min-h-11 flex-[1.4] items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:brightness-110 sm:flex-none sm:px-6"
            >
              <BadgeCheck className="size-4" />
              Confirm
            </button>
          </div>
        </div>

        {controlsOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-overlay lg:hidden"
              onClick={() => setControlsOpen(false)}
              aria-label="Close controls overlay"
            />
            <section
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[min(85dvh,40rem)] flex-col rounded-t-2xl border-t border-border bg-popover text-popover-foreground shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Design controls"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Design Studio
                  </p>
                  <p className="truncate text-sm font-bold">Upload &amp; Customize</p>
                </div>
                <button
                  type="button"
                  onClick={() => setControlsOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Close controls"
                >
                  <ChevronDown className="size-5" />
                </button>
              </div>
              <div className="shrink-0 border-b border-border px-4 py-2">
                <button
                  type="button"
                  onClick={() => {
                    setControlsOpen(false);
                    setMode('pro');
                  }}
                  className="w-full rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-left text-xs font-semibold text-primary"
                >
                  Book Verveo Pro designers →
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
                <UploadPanel name={designConfig.productType} hideHeader />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
