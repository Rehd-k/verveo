'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  CirclePlus,
  MapPin,
  Package,
  Search,
  ScanLine,
  Wallet,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import CampaignCardActions from '@/components/campaigns/CampaignCardActions';
import { useAuth } from '@/store/authStore';
import { useCampaign } from '@/store/campaignStore';
import { PRODUCT_SLUG_LABELS } from '@/lib/campaignSummary';
import { authHeaders } from '@/lib/fetchAuth';
import type { Campaign } from '@/types';

type StatusFilter = 'all' | Campaign['status'];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'processing', label: 'Processing' },
  { value: 'printing', label: 'Printing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_STYLES: Record<Campaign['status'], string> = {
  draft: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  printing: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  dispatched: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  live: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  completed: 'bg-card/10 text-muted-foreground border-border',
};

function getCampaignId(campaign: Campaign) {
  return campaign._id || campaign.id || '';
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

function StatusBadge({ status }: { status: Campaign['status'] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const { campaigns, loading, fetchCampaigns, deleteCampaign } = useCampaign();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCampaigns(user.id);
    }
  }, [user, fetchCampaigns]);

  const stats = useMemo(() => {
    const activeStatuses: Campaign['status'][] = ['processing', 'printing', 'dispatched', 'live'];
    const active = campaigns.filter((c) => activeStatuses.includes(c.status)).length;
    const drafts = campaigns.filter((c) => c.status === 'draft').length;
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalScans = campaigns.reduce((sum, c) => sum + (c.stats?.scans || 0), 0);

    return { active, drafts, totalSpend, totalScans };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campaigns
      .filter((campaign) => {
        if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;
        if (!query) return true;

        const haystack = [
          campaign.title,
          campaign.productType,
          campaign.locations?.join(' '),
          campaign.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      })
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [campaigns, search, statusFilter]);

  const handleViewAnalytics = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/analytics/campaign/${campaignId}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Analytics fetch failed');
      const data = await res.json();
      window.open(
        'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)),
        '_blank'
      );
    } catch (err) {
      console.error(err);
      alert('Failed to fetch analytics');
    }
  };

  const handleDelete = async () => {
    if (!campaignToDelete || deleting) return;

    const id = getCampaignId(campaignToDelete);
    setDeleting(true);
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
      setCampaignToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track status, spend, and performance across all your campaigns.
            </p>
          </div>
          <Link
            href="/campaign"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors"
          >
            <CirclePlus className="size-4" />
            New Campaign
          </Link>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{campaigns.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Drafts</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">{stats.drafts}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Spend</p>
            <p className="mt-2 text-2xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              ₦{stats.totalSpend.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalScans.toLocaleString()} total scans</p>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
            {STATUS_OPTIONS.map((option) => {
              const count =
                option.value === 'all'
                  ? campaigns.length
                  : campaigns.filter((c) => c.status === option.value).length;

              return (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    statusFilter === option.value
                      ? 'bg-primary/20 border-primary/40 text-primary-foreground'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {option.label}
                  <span className="ml-1.5 text-foreground/40">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </section>

        {/* Campaign list */}
        <section className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
              <p className="text-muted-foreground">
                {campaigns.length === 0
                  ? 'No campaigns yet. Create your first one to get started.'
                  : 'No campaigns match your filters.'}
              </p>
              {campaigns.length === 0 && (
                <Link
                  href="/campaign"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <CirclePlus className="size-4" />
                  Create Campaign
                </Link>
              )}
            </div>
          ) : (
            filteredCampaigns.map((campaign) => {
              const id = getCampaignId(campaign);
              const productLabel =
                PRODUCT_SLUG_LABELS[campaign.productType] || campaign.productType;

              return (
                <article
                  key={id}
                  className="rounded-xl border border-border bg-card p-5 hover:border-border transition-colors"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4 min-w-0 flex-1">
                      {campaign.design?.imageUrl ? (
                        <div className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border">
                          <img
                            src={campaign.design.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg border border-border bg-card items-center justify-center">
                          <Package className="size-5 sm:size-6 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-foreground truncate">{campaign.title}</h2>
                          <StatusBadge status={campaign.status} />
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Package className="size-3.5" />
                            {productLabel} · {campaign.quantity.toLocaleString()} units
                          </span>
                          {campaign.locations?.length > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="size-3.5" />
                              {campaign.locations.slice(0, 2).join(', ')}
                              {campaign.locations.length > 2 && ` +${campaign.locations.length - 2}`}
                            </span>
                          )}
                          <span>Updated {formatDate(campaign.updatedAt || campaign.createdAt)}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-foreground font-semibold">
                            ₦{campaign.budget?.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <ScanLine className="size-3.5" />
                            {(campaign.stats?.scans || 0).toLocaleString()} scans
                          </span>
                          <span className="text-muted-foreground">
                            {(campaign.stats?.impressions || 0).toLocaleString()} impressions
                          </span>
                        </div>
                      </div>
                    </div>

                    <CampaignCardActions
                      campaign={campaign}
                      campaignId={id}
                      onViewAnalytics={handleViewAnalytics}
                      onDelete={setCampaignToDelete}
                    />
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!campaignToDelete}
        title="Delete Campaign"
        message={
          campaignToDelete
            ? `Delete "${campaignToDelete.title}"? This cannot be undone.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => !deleting && setCampaignToDelete(null)}
      />
    </main>
  );
}
