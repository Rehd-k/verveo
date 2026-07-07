'use client';

import { MapPin, Package, Palette, Users, Link2 } from 'lucide-react';
import type { CampaignSummary } from '@/lib/campaignSummary';

interface CampaignSummaryCardProps {
  summary: CampaignSummary;
  title: string;
  onTitleChange: (title: string) => void;
}

function SummarySection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h4 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-white/50">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}

export default function CampaignSummaryCard({
  summary,
  title,
  onTitleChange,
}: CampaignSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-[#1c1a15] to-[#0f0d0a] p-6 space-y-6 shadow-xl">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">
          Campaign Summary
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Name your campaign..."
          className="w-full text-2xl font-bold bg-transparent border-b border-white/10 pb-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummarySection icon={<MapPin className="size-4" />} title="Targeting">
          <StatRow label="Districts" value={summary.targetDistricts || '—'} />
          <StatRow
            label="Locations"
            value={summary.locations.length > 0 ? summary.locations.join(', ') : '—'}
          />
          <StatRow
            label="Venue types"
            value={summary.venueTypes.length > 0 ? summary.venueTypes.join(', ') : '—'}
          />
          <StatRow label="Target venues" value={summary.venueCount.toLocaleString()} />
          <StatRow
            label="Est. reach"
            value={`~${summary.estimatedReach.toLocaleString()} / day`}
          />
        </SummarySection>

        <SummarySection icon={<Package className="size-4" />} title="Product">
          <StatRow label="Packaging" value={summary.productLabel} />
          <StatRow label="Quantity" value={`${summary.quantity.toLocaleString()} units`} />
          <StatRow label="Unit price" value={`₦${summary.unitPrice.toLocaleString()}`} />
          <div className="pt-2 border-t border-white/10">
            <StatRow label="Estimated total" value={`₦${summary.budget.toLocaleString()}`} />
          </div>
        </SummarySection>

        <SummarySection icon={<Palette className="size-4" />} title="Design">
          {summary.designImageUrl ? (
            <div className="rounded-lg overflow-hidden border border-white/10 mb-2">
              <img
                src={summary.designImageUrl}
                alt="Design preview"
                className="w-full h-28 object-cover"
              />
            </div>
          ) : (
            <p className="text-sm text-white/40">No texture uploaded</p>
          )}
          {summary.brandText && (
            <StatRow label="Brand text" value={`"${summary.brandText}"`} />
          )}
          {summary.colors.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-white/50">Colors</span>
              <div className="flex gap-1.5 ml-auto">
                {summary.colors.map((color) => (
                  <div
                    key={color}
                    className="w-6 h-6 rounded-md border border-white/20"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </SummarySection>

        <SummarySection icon={<Users className="size-4" />} title="Launch">
          <StatRow label="Product code" value={summary.productSlug} />
          <StatRow label="Status" value="Ready to launch" />
          {summary.ctaUrl ? (
            <div className="flex items-start gap-2 pt-1 text-sm">
              <Link2 className="size-4 text-primary shrink-0 mt-0.5" />
              <span className="text-white/70 break-all">{summary.ctaUrl}</span>
            </div>
          ) : (
            <p className="text-sm text-amber-400/80">Add a CTA URL to complete setup</p>
          )}
        </SummarySection>
      </div>
    </div>
  );
}
