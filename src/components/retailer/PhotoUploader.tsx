'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Loader2 } from 'lucide-react';
import { authHeaders } from '@/lib/fetchAuth';

interface PhotoUploaderProps {
  campaigns: Array<{ id: string; title: string }>;
  onUploaded: () => void;
}

export default function PhotoUploader({ campaigns, onUploaded }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [campaignId, setCampaignId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Choose a proof photo first');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const uploadRes = await fetch('/api/retailer/proofs/upload', {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      });
      const upload = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(upload.error || 'Upload failed');

      const proofRes = await fetch('/api/retailer/proofs', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          imageUrl: upload.imageUrl,
          campaignId: campaignId || undefined,
          notes: notes || undefined,
        }),
      });
      const proof = await proofRes.json().catch(() => ({}));
      if (!proofRes.ok) throw new Error(proof.error || 'Proof creation failed');

      toast.success('Proof submitted for review');
      setFile(null);
      setCampaignId('');
      setNotes('');
      onUploaded();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit proof';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-card-dark/80 p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Camera className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold">Upload proof of execution</h2>
          <p className="text-sm text-text-secondary">Show branded packs in use at your venue.</p>
        </div>
      </div>

      <label className="mt-5 block rounded-xl border border-dashed border-white/15 bg-background-dark/70 p-5 text-center text-sm text-text-secondary transition hover:border-primary/50">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? file.name : 'Choose JPG, PNG, or WEBP proof photo'}
      </label>

      <label className="mt-4 block text-sm font-medium text-white/70">
        Campaign
        <select
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
        >
          <option value="">General proof / no campaign selected</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium text-white/70">
        Notes
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
          placeholder="Describe where and when the photo was taken."
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? 'Submitting...' : 'Submit proof'}
      </button>
    </form>
  );
}
