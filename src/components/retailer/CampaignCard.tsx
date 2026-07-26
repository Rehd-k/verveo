import { Package, ScanLine } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description?: string;
    productType: string;
    quantity: number;
    locations?: string[];
    status: string;
    design?: {
      imageUrl?: string;
      text?: string;
      colors?: string[];
    };
  };
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30">
      <div className="flex gap-4">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-border bg-background bg-cover bg-center"
          style={{
            backgroundImage: campaign.design?.imageUrl
              ? `url(${campaign.design.imageUrl})`
              : undefined,
          }}
        >
          {!campaign.design?.imageUrl && <Package className="size-6 text-primary" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{campaign.title}</h3>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {campaign.description || campaign.design?.text || 'Distribute branded packaging for this campaign.'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-card p-3">
          <p className="text-xs text-muted-foreground">Product</p>
          <p className="mt-1 text-sm font-semibold capitalize">{campaign.productType.replace('-', ' ')}</p>
        </div>
        <div className="rounded-xl bg-card p-3">
          <p className="text-xs text-muted-foreground">Quantity</p>
          <p className="mt-1 text-sm font-semibold">{campaign.quantity.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-card p-3">
          <p className="text-xs text-muted-foreground">Locations</p>
          <p className="mt-1 text-sm font-semibold">{campaign.locations?.join(', ') || 'Matched city'}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <ScanLine className="size-3.5 text-primary" />
        Upload proof when branded packs are visible at your venue.
      </div>
    </div>
  );
}
