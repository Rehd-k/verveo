'use client';

import { StatusBadge } from './StatusBadge';
import type { Proof } from '@/types';

interface ProofReviewCardProps {
  proof: Proof & {
    id?: string;
    retailer?: { businessName?: string; venueType?: string };
    campaign?: { title?: string };
  };
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}

export function ProofReviewCard({ proof, onApprove, onReject, loading }: ProofReviewCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="aspect-video bg-overlay relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proof.imageUrl}
          alt="Proof of placement"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <StatusBadge status={proof.status || 'pending'} />
          <span className="text-xs text-muted-foreground">
            {proof.createdAt ? new Date(proof.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          <p><span className="text-muted-foreground">Retailer:</span> {proof.retailer?.businessName || proof.retailerId}</p>
          {proof.campaign?.title && (
            <p><span className="text-muted-foreground">Campaign:</span> {proof.campaign.title}</p>
          )}
          {proof.notes && <p className="mt-1 text-muted-foreground">{proof.notes}</p>}
        </div>
        {proof.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-foreground hover:bg-emerald-500 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              disabled={loading}
              className="flex-1 rounded-lg bg-destructive/80 py-2 text-sm font-semibold text-foreground hover:brightness-110 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
