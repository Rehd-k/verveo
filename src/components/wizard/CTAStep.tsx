'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { useCampaignStore } from '@/store/useCampaignStore';
import { buildCampaignSummary, type CampaignDataShape } from '@/lib/campaignSummary';
import CampaignSummaryCard from './CampaignSummaryCard';

interface CTAStepProps {
  data: CampaignDataShape;
  updateData: (data: Partial<CampaignDataShape>) => void;
  prevStage?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  variant?: 'embedded' | 'fullPage';
}

const QUICK_LINKS = [
  { name: 'WhatsApp', key: 'whatsapp', prefix: 'https://wa.me/234' },
  { name: 'Phone Call', key: 'phone', prefix: 'tel:+234' },
  { name: 'Website', key: 'website', prefix: 'https://' },
  { name: 'Instagram', key: 'instagram', prefix: 'https://instagram.com/' },
];

function getPreviewTrackingUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${base.replace(/\/$/, '')}/api/qr/preview`;
}

function isValidCtaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'https://' || trimmed === 'tel:+234') return false;
  return true;
}

export default function CTAStep({
  data,
  updateData,
  prevStage,
  onSubmit,
  loading = false,
  variant = 'embedded',
}: CTAStepProps) {
  const store = useCampaignStore();
  const [ctaType, setCtaType] = useState('custom');
  const [previewQr, setPreviewQr] = useState('');

  const summary = useMemo(
    () =>
      buildCampaignSummary(data, {
        selectedProduct: store.selectedProduct,
        quantity: store.quantity,
        designConfig: store.designConfig,
        targetLocation: store.targetLocation,
        selectedBusinesses: store.selectedBusinesses,
        estimatedReach: store.estimatedReach,
      }),
    [data, store]
  );

  const generatePreviewQr = useCallback(async (ctaUrl: string) => {
    if (!isValidCtaUrl(ctaUrl)) {
      setPreviewQr('');
      return;
    }

    try {
      const qr = await QRCode.toDataURL(getPreviewTrackingUrl(), {
        width: 220,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      setPreviewQr(qr);
    } catch (error) {
      console.error('QR preview generation failed:', error);
      setPreviewQr('');
    }
  }, []);

  useEffect(() => {
    if (!data.ctaUrl?.trim()) {
      setPreviewQr('');
      return;
    }
    const timer = setTimeout(() => generatePreviewQr(data.ctaUrl!), 300);
    return () => clearTimeout(timer);
  }, [data.ctaUrl, generatePreviewQr]);

  const handleQuickLink = (key: string, prefix: string) => {
    setCtaType(key);
    updateData({ ctaUrl: prefix });
  };

  const canSubmit = isValidCtaUrl(data.ctaUrl || '');

  const ctaContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">Call-to-Action</h3>
        <p className="text-muted-foreground">
          Where should people go when they scan your QR code?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.key}
            type="button"
            onClick={() => handleQuickLink(link.key, link.prefix)}
            className={`p-3 rounded-lg border transition-all text-left ${
              ctaType === link.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-foreground hover:border-border'
            }`}
          >
            <span className="font-semibold">{link.name}</span>
            <p className="text-xs text-muted-foreground mt-1 truncate">{link.prefix}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Complete URL</label>
        <input
          type="url"
          value={data.ctaUrl || ''}
          onChange={(e) => updateData({ ctaUrl: e.target.value })}
          placeholder="https://example.com"
          className="w-full rounded-lg bg-card border border-border px-4 py-3 text-foreground placeholder-white/30"
        />
      </div>

      {previewQr && (
        <div className="p-6 rounded-lg bg-card border border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">Tracking QR Preview</p>
          <img
            src={previewQr}
            alt="QR Code preview"
            className="w-48 h-48 mx-auto rounded-lg border-2 border-border bg-card p-2"
          />
          <p className="text-xs text-muted-foreground mt-4 break-all">
            Destination: {data.ctaUrl}
          </p>
          <p className="text-xs text-primary/80 mt-2">
            Final QR encodes your unique tracking link when the campaign is created.
          </p>
        </div>
      )}

      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-primary">Pro Tip:</span> Each campaign gets a unique
          tracking QR code. We record scan time, device, and location, then redirect visitors to
          your destination with UTM tags.
        </p>
      </div>
    </div>
  );

  const layout = (
    <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-8 lg:space-y-0">
      <div>{ctaContent}</div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <CampaignSummaryCard
          summary={summary}
          title={data.title || ''}
          onTitleChange={(title) => updateData({ title })}
        />
      </div>
    </div>
  );

  if (variant === 'fullPage') {
    return (
      <div className="flex flex-col min-h-[91.5vh] bg-[#0f0d0a]">
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8">{layout}</div>
        <div className="border-t border-border px-4 md:px-12 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={prevStage}
            className="w-full sm:w-auto px-6 py-3 bg-card border border-border hover:border-primary rounded-lg text-foreground font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => onSubmit?.()}
            disabled={loading || !canSubmit}
            className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BadgeCheck className="size-4" />
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </div>
    );
  }

  return layout;
}
