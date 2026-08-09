'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { QrCode, Trash2, Printer, Truck } from 'lucide-react';
import { useAdmin } from '@/store/adminStore';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { STATUS_LABELS } from '@/lib/fulfillment/constants';
import type { Campaign, CampaignStatus } from '@/types';

type MatchingRetailer = {
  id: string;
  businessName: string;
  city: string;
  venueType: string;
  status: string;
  address?: string;
  currentStock: number;
  allowance: number;
};

type CampaignDetail = Campaign & {
  owner?: { email: string; name: string };
  matchingRetailers?: MatchingRetailer[];
  printJob?: {
    title: string;
    productType: string;
    quantity: number;
    locations: string[];
    venueTypes: string[];
    designImageUrl?: string;
    designText?: string;
    designColors?: string[];
    handoff?: string;
    qrCode?: string;
    ctaUrl?: string;
    budget: number;
    advertiser: { name: string; email: string } | null;
  };
};

const OPS_STATUSES: CampaignStatus[] = [
  'processing',
  'printing',
  'dispatched',
  'live',
  'completed',
  'draft',
];

function toDateInput(value?: string | Date) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function AdminCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { adminFetch } = useAdmin();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [status, setStatus] = useState<CampaignStatus>('processing');
  const [statusNote, setStatusNote] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [trackingRef, setTrackingRef] = useState('');
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkedPartners, setCheckedPartners] = useState<Record<string, boolean>>({});

  const load = () => {
    adminFetch<CampaignDetail>(`/api/admin/campaigns/${id}`)
      .then((data) => {
        setCampaign(data);
        setStatus(data.status);
        setStatusNote(data.statusNote || '');
        setExpectedAt(toDateInput(data.expectedAt));
        setTrackingRef(data.trackingRef || '');
      })
      .catch(() => toast.error('Failed to load'));
  };

  useEffect(() => {
    load();
  }, [id, adminFetch]);

  const saveStatus = async () => {
    setSaving(true);
    try {
      await adminFetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          statusNote: statusNote || null,
          expectedAt: expectedAt || null,
          trackingRef: trackingRef || null,
          notify,
        }),
      });
      toast.success(notify ? 'Status updated · advertiser notified' : 'Status updated');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const regenerateQr = async () => {
    try {
      const data = await adminFetch<{ qrCode: string }>(
        `/api/admin/campaigns/${id}/regenerate-qr`,
        { method: 'POST' }
      );
      setCampaign((c) => (c ? { ...c, qrCode: data.qrCode } : c));
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

  const printSheet = () => {
    window.print();
  };

  if (!campaign) return <div className="text-muted-foreground">Loading...</div>;

  const job = campaign.printJob;
  const retailers = campaign.matchingRetailers || [];
  const history = [...(campaign.statusHistory || [])].reverse();

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/fulfillment" className="text-sm text-primary hover:underline">
          ← Fulfillment queue
        </Link>
        <Link href="/admin/campaigns" className="text-sm text-muted-foreground hover:underline">
          All campaigns
        </Link>
      </div>

      <div className="print:hidden flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{campaign.title}</h2>
          <p className="text-muted-foreground">
            {campaign.owner?.email} · {campaign.owner?.name}
          </p>
          <div className="mt-2">
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={printSheet}
            className="flex min-h-11 items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
          >
            <Printer className="size-4" /> Print job sheet
          </button>
          <button
            type="button"
            onClick={regenerateQr}
            className="flex min-h-11 items-center justify-center gap-1 rounded-lg bg-card/10 px-3 py-2 text-sm hover:bg-card/15"
          >
            <QrCode className="size-4" /> Regenerate QR
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="flex min-h-11 items-center justify-center gap-1 rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive hover:bg-destructive/30"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>

      {/* Ops status update */}
      <div className="print:hidden rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Advance status</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-muted-foreground">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CampaignStatus)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {OPS_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-muted-foreground">
            Expected date
            <input
              type="date"
              value={expectedAt}
              onChange={(e) => setExpectedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm text-muted-foreground sm:col-span-2">
            Note to advertiser
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
              placeholder="e.g. Printing started; expected finish Friday"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm text-muted-foreground sm:col-span-2">
            Tracking / dispatch ref
            <input
              value={trackingRef}
              onChange={(e) => setTrackingRef(e.target.value)}
              placeholder="Internal run ID or courier reference"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="rounded border-border"
          />
          Notify advertiser on save
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={saveStatus}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save status'}
        </button>
      </div>

      {/* Printable job sheet */}
      <div id="print-job-sheet" className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Printer className="size-4 text-primary print:hidden" />
          <h3 className="font-semibold text-foreground">Print job sheet</h3>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">Job</span>
            <span className="font-medium text-right">{job?.title || campaign.title}</span>
          </div>
          <div className="flex justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">Advertiser</span>
            <span className="text-right">
              {job?.advertiser?.name} ({job?.advertiser?.email})
            </span>
          </div>
          <div className="flex justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">Product</span>
            <span className="capitalize">
              {campaign.productType} × {campaign.quantity.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">Budget</span>
            <span>₦{campaign.budget?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-2 border-b border-border py-2 sm:col-span-2">
            <span className="text-muted-foreground">Cities / zones</span>
            <span className="text-right">{campaign.locations?.join(', ') || '—'}</span>
          </div>
          <div className="flex justify-between gap-2 border-b border-border py-2 sm:col-span-2">
            <span className="text-muted-foreground">Venue types</span>
            <span className="text-right">{campaign.venueTypes?.join(', ') || '—'}</span>
          </div>
          <div className="flex justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">Design handoff</span>
            <span>{campaign.design?.handoff === 'verveo_team' ? 'Verveo team' : 'Self-serve'}</span>
          </div>
          <div className="flex justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">CTA</span>
            <span className="truncate max-w-50">{campaign.ctaUrl || '—'}</span>
          </div>
        </div>
        {(campaign.design?.imageUrl || campaign.design?.previewUrl) && (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Design asset</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.design.imageUrl || campaign.design.previewUrl}
              alt="Design"
              className="max-h-56 rounded-lg border border-border"
            />
          </div>
        )}
        {campaign.qrCode && (
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campaign.qrCode} alt="QR" className="h-28 w-28 rounded bg-white p-1" />
            <p className="text-xs text-muted-foreground">Print QR on packaging unit</p>
          </div>
        )}
      </div>

      {/* Dispatch checklist */}
      <div className="print:hidden rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">Dispatch checklist</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Active/pending partners matching campaign cities and venue types. Check off as you allocate
          stock.
        </p>
        {retailers.length === 0 ? (
          <p className="text-sm text-amber-600">
            No matching partners found — add retailers in those cities before dispatch.
          </p>
        ) : (
          <ul className="space-y-2">
            {retailers.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={!!checkedPartners[r.id]}
                  onChange={(e) =>
                    setCheckedPartners((prev) => ({ ...prev, [r.id]: e.target.checked }))
                  }
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/retailers/${r.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {r.businessName}
                    </Link>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {r.city} · {r.venueType}
                    {r.address ? ` · ${r.address}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stock {r.currentStock} / allowance {r.allowance}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {trackingRef && (
          <p className="text-sm text-muted-foreground">
            Tracking ref: <span className="text-foreground">{trackingRef}</span>
          </p>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="print:hidden rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Status history</h3>
          <ol className="space-y-3">
            {history.map((h, i) => (
              <li key={`${h.status}-${h.createdAt}-${i}`} className="border-l-2 border-primary/40 pl-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={h.status} />
                  <span className="text-xs text-muted-foreground">
                    {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                {h.note && <p className="mt-1 text-muted-foreground">{h.note}</p>}
                {h.expectedAt && (
                  <p className="text-xs text-muted-foreground">
                    Expected {toDateInput(h.expectedAt)}
                  </p>
                )}
                {h.trackingRef && (
                  <p className="text-xs text-muted-foreground">Ref {h.trackingRef}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        title="Delete Campaign"
        message="This will permanently delete the campaign and cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-job-sheet, #print-job-sheet * { visibility: visible; }
          #print-job-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
          }
        }
      `}</style>
    </div>
  );
}
