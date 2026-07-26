'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import RetailerPageHeader from '@/components/retailer/RetailerPageHeader';
import { useRetailerShell } from '@/components/retailer/RetailerShellContext';
import CampaignCard from '@/components/retailer/CampaignCard';
import { useRetailer } from '@/store/retailerStore';

export default function RetailerCampaignsPage() {
  const { toggleMobile } = useRetailerShell();
  const { campaigns, loading, refreshAll } = useRetailer();
  const [search, setSearch] = useState('');

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return campaigns;
    return campaigns.filter((campaign) =>
      campaign.title.toLowerCase().includes(query)
    );
  }, [campaigns, search]);

  return (
    <div>
      <RetailerPageHeader
        title="Active Campaigns"
        description="Live and dispatched campaigns matched to your city and venue type."
        onMenuClick={toggleMobile}
      />

      <div className="space-y-6 p-4 md:p-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary/70"
          />
        </div>

        {loading && campaigns.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-semibold text-foreground">No matched campaigns yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Campaigns appear here when advertisers target your city and venue type with live or dispatched status.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.id || campaign._id}
                campaign={{
                  id: campaign.id || campaign._id || '',
                  title: campaign.title,
                  description: campaign.description,
                  productType: campaign.productType,
                  quantity: campaign.quantity,
                  locations: campaign.locations,
                  status: campaign.status,
                  design: campaign.design,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
