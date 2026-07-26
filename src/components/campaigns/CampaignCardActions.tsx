'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  ExternalLink,
  MoreHorizontal,
  QrCode,
  Trash2,
} from 'lucide-react';
import type { Campaign } from '@/types';

interface CampaignCardActionsProps {
  campaign: Campaign;
  campaignId: string;
  onViewAnalytics: (id: string) => void;
  onDelete: (campaign: Campaign) => void;
}

export default function CampaignCardActions({
  campaign,
  campaignId,
  onViewAnalytics,
  onDelete,
}: CampaignCardActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const desktopActions = (
    <>
      {campaign.qrCode && (
        <div className="hidden md:flex flex-col items-center gap-1 mr-2">
          <img
            src={campaign.qrCode}
            alt={`QR code for ${campaign.title}`}
            className="w-20 h-20 rounded-lg border border-border bg-card p-1"
          />
          <a
            href={campaign.qrCode}
            download={`${campaign.title.replace(/\s+/g, '-').toLowerCase()}-qr.png`}
            className="text-[10px] font-medium text-primary hover:text-foreground transition-colors"
          >
            Download
          </a>
        </div>
      )}
      {campaign.status === 'draft' && (
        <Link
          href="/campaign"
          className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
        >
          Resume
        </Link>
      )}
      <button
        onClick={() => onViewAnalytics(campaignId)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
      >
        <BarChart3 className="size-3.5" />
        Analytics
      </button>
      {campaign.ctaUrl && (
        <a
          href={campaign.ctaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <ExternalLink className="size-3.5" />
          CTA
        </a>
      )}
      <Link
        href={`/api/qr/${campaignId}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
      >
        <QrCode className="size-3.5" />
        QR
      </Link>
      {campaign.status === 'draft' && (
        <Link
          href={`/dashboard/checkout?campaignId=${campaignId}`}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-blue-600 transition-colors"
        >
          Checkout
        </Link>
      )}
      <button
        onClick={() => onDelete(campaign)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-destructive hover:brightness-110/20 transition-colors"
      >
        <Trash2 className="size-3.5" />
        Delete
      </button>
    </>
  );

  const mobileActions = (
    <>
      {campaign.status === 'draft' && (
        <>
          <Link
            href="/campaign"
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            Resume
          </Link>
          <Link
            href={`/dashboard/checkout?campaignId=${campaignId}`}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-blue-600 transition-colors"
          >
            Checkout
          </Link>
        </>
      )}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-accent transition-colors"
          aria-label="More actions"
        >
          <MoreHorizontal className="size-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-2xl">
            <button
              type="button"
              onClick={() => {
                onViewAnalytics(campaignId);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-accent"
            >
              <BarChart3 className="size-3.5" />
              Analytics
            </button>
            {campaign.ctaUrl && (
              <a
                href={campaign.ctaUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
              >
                <ExternalLink className="size-3.5" />
                CTA
              </a>
            )}
            <Link
              href={`/api/qr/${campaignId}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
            >
              <QrCode className="size-3.5" />
              QR Link
            </Link>
            {campaign.qrCode && (
              <a
                href={campaign.qrCode}
                download={`${campaign.title.replace(/\s+/g, '-').toLowerCase()}-qr.png`}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
              >
                <QrCode className="size-3.5" />
                Download QR
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                onDelete(campaign);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-destructive hover:brightness-110/10"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end shrink-0 items-start">
      <div className="hidden md:contents">{desktopActions}</div>
      <div className="contents md:hidden">{mobileActions}</div>
    </div>
  );
}
