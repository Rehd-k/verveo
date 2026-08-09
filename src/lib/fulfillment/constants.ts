import type { CampaignStatus } from '@/types';

export const FULFILLMENT_STATUSES = [
  'processing',
  'printing',
  'dispatched',
  'live',
  'completed',
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export type { CampaignStatus };

/** Allowed forward transitions for in-house ops (admins can still jump via UI if needed). */
export const STATUS_FLOW: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['processing'],
  processing: ['printing', 'draft'],
  printing: ['dispatched', 'processing'],
  dispatched: ['live', 'printing'],
  live: ['completed', 'dispatched'],
  completed: ['live'],
};

export function isFulfillmentQueueStatus(status: string): boolean {
  return ['processing', 'printing', 'dispatched'].includes(status);
}

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  processing: 'Paid — queue',
  printing: 'Printing',
  dispatched: 'Dispatched',
  live: 'Live',
  completed: 'Completed',
};
