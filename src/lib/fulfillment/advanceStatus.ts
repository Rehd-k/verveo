import mongoose from 'mongoose';
import { Campaign } from '@/models/Campaign';
import { notifyCampaignStatusChange } from '@/lib/fulfillment/notify';
import type { CampaignStatus } from '@/lib/fulfillment/constants';
import { writeAuditLog } from '@/lib/audit';

export type StatusHistoryEntry = {
  status: CampaignStatus;
  note?: string;
  expectedAt?: Date;
  trackingRef?: string;
  changedBy?: string;
  createdAt: Date;
};

export async function advanceCampaignStatus(params: {
  campaignId: string;
  status: CampaignStatus;
  note?: string;
  expectedAt?: string | Date | null;
  trackingRef?: string;
  changedBy: string;
  notify?: boolean;
}) {
  const campaign = await Campaign.findById(params.campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const fromStatus = campaign.status as CampaignStatus;
  const toStatus = params.status;

  const expectedAt = params.expectedAt
    ? params.expectedAt instanceof Date
      ? params.expectedAt
      : new Date(params.expectedAt)
    : undefined;

  if (expectedAt && Number.isNaN(expectedAt.getTime())) {
    throw new Error('Invalid expectedAt date');
  }

  const historyEntry = {
    status: toStatus,
    note: params.note?.trim() || undefined,
    expectedAt: expectedAt || undefined,
    trackingRef: params.trackingRef?.trim() || undefined,
    changedBy: new mongoose.Types.ObjectId(params.changedBy),
    createdAt: new Date(),
  };

  campaign.status = toStatus;
  if (params.note !== undefined) campaign.statusNote = params.note.trim() || undefined;
  if (expectedAt !== undefined) campaign.expectedAt = expectedAt;
  if (params.expectedAt === null) campaign.expectedAt = undefined;
  if (params.trackingRef !== undefined) {
    campaign.trackingRef = params.trackingRef.trim() || undefined;
  }

  if (!Array.isArray(campaign.statusHistory)) {
    campaign.statusHistory = [];
  }
  campaign.statusHistory.push(historyEntry);

  await campaign.save();

  await writeAuditLog({
    actorId: params.changedBy,
    action: 'campaign.status_change',
    targetType: 'Campaign',
    targetId: params.campaignId,
    before: { status: fromStatus },
    after: {
      status: toStatus,
      note: params.note,
      expectedAt,
      trackingRef: params.trackingRef,
    },
  });

  if (params.notify !== false && fromStatus !== toStatus) {
    await notifyCampaignStatusChange({
      campaignId: params.campaignId,
      campaignTitle: campaign.title,
      userId: campaign.userId.toString(),
      actorId: params.changedBy,
      fromStatus,
      toStatus,
      note: params.note,
      expectedAt: campaign.expectedAt,
      trackingRef: campaign.trackingRef,
    });
  }

  return campaign;
}
