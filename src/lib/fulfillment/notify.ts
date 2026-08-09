import { User } from '@/models/User';
import { writeAuditLog } from '@/lib/audit';
import { STATUS_LABELS, type CampaignStatus } from '@/lib/fulfillment/constants';

/**
 * Notify advertiser of a campaign status change.
 * Logs today; wire SMTP/Resend when EMAIL_* env is available.
 */
export async function notifyCampaignStatusChange(params: {
  campaignId: string;
  campaignTitle: string;
  userId: string;
  actorId: string;
  fromStatus: CampaignStatus;
  toStatus: CampaignStatus;
  note?: string;
  expectedAt?: Date | null;
  trackingRef?: string;
}): Promise<void> {
  const owner = await User.findById(params.userId).select('email name').lean();
  if (!owner?.email) {
    console.warn('[notify] No owner email for campaign', params.campaignId);
    return;
  }

  const expected =
    params.expectedAt instanceof Date
      ? params.expectedAt.toISOString().slice(0, 10)
      : params.expectedAt
        ? String(params.expectedAt).slice(0, 10)
        : null;

  const subject = `Verveo: "${params.campaignTitle}" is now ${STATUS_LABELS[params.toStatus]}`;
  const lines = [
    `Hi ${owner.name},`,
    '',
    `Your campaign "${params.campaignTitle}" moved from ${STATUS_LABELS[params.fromStatus]} to ${STATUS_LABELS[params.toStatus]}.`,
    params.note ? `Note: ${params.note}` : null,
    expected ? `Expected date: ${expected}` : null,
    params.trackingRef ? `Tracking: ${params.trackingRef}` : null,
    '',
    'View progress in your Verveo dashboard.',
  ].filter(Boolean);

  const body = lines.join('\n');

  if (process.env.SMTP_HOST || process.env.RESEND_API_KEY) {
    console.info('[notify:email-ready]', { to: owner.email, subject });
  }

  console.info('[notify:campaign-status]', {
    to: owner.email,
    subject,
    body,
  });

  await writeAuditLog({
    actorId: params.actorId,
    action: 'campaign.status_notified',
    targetType: 'Campaign',
    targetId: params.campaignId,
    after: {
      to: owner.email,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      subject,
    },
  }).catch(() => {
    // non-fatal
  });
}
