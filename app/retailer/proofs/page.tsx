'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import RetailerPageHeader from '@/components/retailer/RetailerPageHeader';
import { useRetailerShell } from '@/components/retailer/RetailerShellContext';
import PhotoUploader from '@/components/retailer/PhotoUploader';
import ProofGalleryCard from '@/components/retailer/ProofGalleryCard';
import { useRetailer } from '@/store/retailerStore';

type ProofFilter = 'all' | 'pending' | 'approved' | 'rejected';

const FILTERS: { value: ProofFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function RetailerProofsPage() {
  const { toggleMobile } = useRetailerShell();
  const { profile, campaigns, proofs, loading, refreshAll, fetchProofs } = useRetailer();
  const [filter, setFilter] = useState<ProofFilter>('all');

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const filtered = useMemo(() => {
    if (filter === 'all') return proofs;
    return proofs.filter((proof) => proof.status === filter);
  }, [proofs, filter]);

  const campaignOptions = campaigns.map((campaign) => ({
    id: campaign.id || campaign._id || '',
    title: campaign.title,
  }));

  const canUpload = profile?.status === 'active';

  return (
    <div>
      <RetailerPageHeader
        title="Proof of Execution"
        description="Upload photos showing branded packs in use at your venue."
        onMenuClick={toggleMobile}
      />

      <div className="space-y-6 p-4 md:p-8">
        {!canUpload && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {profile?.status === 'suspended'
              ? 'Your account is suspended. Proof uploads are disabled.'
              : 'Proof uploads are available after your account is activated by an admin.'}
          </div>
        )}

        {canUpload ? (
          <PhotoUploader campaigns={campaignOptions} onUploaded={() => fetchProofs()} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-card-dark/80 p-6 text-sm text-text-secondary">
            Proof uploads will unlock once your partner account is active.
          </div>
        )}

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filter === item.value
                    ? 'bg-primary text-white'
                    : 'border border-white/10 bg-card-dark text-text-secondary hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading && proofs.length === 0 ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card-dark/80 p-8 text-center text-sm text-text-secondary">
              No proofs in this category yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((proof) => (
                <ProofGalleryCard key={proof.id || proof._id} proof={proof} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
