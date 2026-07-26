'use client';

import type { Campaign } from '@/types';

const STATUSES: Campaign['status'][] = [
  'draft',
  'processing',
  'printing',
  'dispatched',
  'live',
  'completed',
];

interface CampaignStatusSelectProps {
  value: Campaign['status'];
  onChange: (status: Campaign['status']) => void;
  disabled?: boolean;
}

export function CampaignStatusSelect({ value, onChange, disabled }: CampaignStatusSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Campaign['status'])}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-card">
          {s}
        </option>
      ))}
    </select>
  );
}
