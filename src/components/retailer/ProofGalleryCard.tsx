import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Proof } from '@/types';

interface ProofGalleryCardProps {
  proof: Proof & {
    campaign?: { title?: string } | string;
  };
}

function formatDate(value?: Date | string) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCampaignTitle(proof: ProofGalleryCardProps['proof']) {
  if (!proof.campaign) return 'General proof';
  if (typeof proof.campaign === 'string') return proof.campaign;
  return proof.campaign.title || 'Campaign proof';
}

export default function ProofGalleryCard({ proof }: ProofGalleryCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-card-dark/80">
      <div
        className="aspect-4/3 bg-cover bg-center bg-background-dark"
        style={{ backgroundImage: `url(${proof.imageUrl})` }}
      />
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-white">
            {getCampaignTitle(proof)}
          </p>
          <StatusBadge status={proof.status || 'pending'} />
        </div>
        <p className="text-xs text-text-secondary">{formatDate(proof.createdAt)}</p>
        {proof.status === 'rejected' && proof.notes && (
          <p className="text-xs text-red-300">{proof.notes}</p>
        )}
      </div>
    </div>
  );
}
