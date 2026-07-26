'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { QrCode, Trash2 } from 'lucide-react';
import { useAdmin } from '@/store/adminStore';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { CampaignStatusSelect } from '@/components/admin/CampaignStatusSelect';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { Campaign } from '@/types';

export default function AdminCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { adminFetch } = useAdmin();
  const [campaign, setCampaign] = useState<Campaign & { owner?: { email: string; name: string } } | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const load = () => {
    adminFetch<typeof campaign>(`/api/admin/campaigns/${id}`).then(setCampaign).catch(() => toast.error('Failed to load'));
  };

  useEffect(() => { load(); }, [id, adminFetch]);

  const updateStatus = async (status: Campaign['status']) => {
    try {
      await adminFetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const regenerateQr = async () => {
    try {
      const data = await adminFetch<{ qrCode: string }>(`/api/admin/campaigns/${id}/regenerate-qr`, { method: 'POST' });
      setCampaign((c) => c ? { ...c, qrCode: data.qrCode } : c);
      toast.success('QR regenerated');
    } catch {
      toast.error('Failed to regenerate QR');
    }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
      toast.success('Campaign deleted');
      window.location.href = '/admin/campaigns';
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (!campaign) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link href="/admin/campaigns" className="text-sm text-primary hover:underline">← Back to campaigns</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{campaign.title}</h2>
          <p className="text-muted-foreground">{campaign.owner?.email} · {campaign.owner?.name}</p>
          <div className="mt-2"><StatusBadge status={campaign.status} /></div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <CampaignStatusSelect value={campaign.status} onChange={updateStatus} />
          <button
            onClick={regenerateQr}
            className="flex min-h-11 w-full items-center justify-center gap-1 rounded-lg bg-card/10 px-3 py-2 text-sm hover:bg-card/15 sm:w-auto"
          >
            <QrCode className="size-4" /> Regenerate QR
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex min-h-11 w-full items-center justify-center gap-1 rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive hover:bg-destructive/30 sm:w-auto"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>{campaign.productType}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{campaign.quantity}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span>₦{campaign.budget?.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Scans</span><span>{campaign.stats?.scans ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Impressions</span><span>{campaign.stats?.impressions ?? 0}</span></div>
          <div className="flex justify-between gap-2"><span className="shrink-0 text-muted-foreground">CTA URL</span><a href={campaign.ctaUrl} target="_blank" rel="noreferrer" className="text-primary truncate max-w-full sm:max-w-[200px]">{campaign.ctaUrl || '—'}</a></div>
          <div><span className="text-muted-foreground">Locations:</span> <span>{campaign.locations?.join(', ') || '—'}</span></div>
        </div>
        {campaign.qrCode && (
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center">
            <p className="mb-3 text-sm text-muted-foreground">QR Code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campaign.qrCode} alt="QR Code" className="w-48 h-48 rounded-lg bg-card p-2" />
          </div>
        )}
        {campaign.design?.imageUrl && (
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <p className="mb-3 text-sm text-muted-foreground">Design Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campaign.design.imageUrl || campaign.design.previewUrl} alt="Design" className="max-h-64 rounded-lg" />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Campaign"
        message="This will permanently delete the campaign and cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
