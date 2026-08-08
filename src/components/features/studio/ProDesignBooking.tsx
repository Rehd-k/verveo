'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Palette, Sparkles } from 'lucide-react';
import { authHeaders } from '@/lib/fetchAuth';
import { useAuth } from '@/store/authStore';
import type { DesignContactMethod } from '@/types';
import { DESIGN_SERVICE_FEE } from '@/lib/designCredit';
import { cn } from '@/lib/cn';

const CONTACT_OPTIONS: { value: DesignContactMethod; label: string; placeholder: string }[] = [
  { value: 'video_call', label: 'Video call', placeholder: 'Meeting link preference or email for invite' },
  { value: 'whatsapp', label: 'WhatsApp', placeholder: 'WhatsApp number (with country code)' },
  { value: 'email', label: 'Email', placeholder: 'Email address' },
  { value: 'phone', label: 'Phone call', placeholder: 'Phone number' },
];

interface ProDesignBookingFormProps {
  campaignId?: string | null;
  onBooked: () => void;
  onBackToChoice: () => void;
}

export function ProDesignBookingForm({
  campaignId,
  onBooked,
  onBackToChoice,
}: ProDesignBookingFormProps) {
  const { user } = useAuth();
  const [containerDescription, setContainerDescription] = useState('');
  const [preferredContact, setPreferredContact] = useState<DesignContactMethod>('whatsapp');
  const [contactValue, setContactValue] = useState(user?.email || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [submitting, setSubmitting] = useState(false);

  const designCredit = user?.designCredit ?? 0;
  const canAfford = designCredit >= DESIGN_SERVICE_FEE;
  const contactMeta = useMemo(
    () => CONTACT_OPTIONS.find((o) => o.value === preferredContact)!,
    [preferredContact]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford) {
      toast.error('Insufficient design credit for Verveo professional design');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select a date and time');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      toast.error('Invalid date or time');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/design-requests', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          containerDescription: containerDescription.trim(),
          preferredContact,
          contactValue: contactValue.trim(),
          scheduledAt: scheduledAt.toISOString(),
          ...(campaignId ? { campaignId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to book design consult');
        return;
      }

      if (typeof data.designCredit === 'number') {
        useAuth.setState({
          user: user ? { ...user, designCredit: data.designCredit } : user,
        });
      }

      toast.success('Design consult booked — our team will reach out');
      onBooked();
    } catch {
      toast.error('Failed to book design consult');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto p-4 md:p-8">
      <button
        type="button"
        onClick={onBackToChoice}
        className="mb-4 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to design options
      </button>

      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Verveo Professional Design</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our designers handle the <strong className="text-foreground">product container itself</strong>
              — shape, structure, and branding — not just the advert artwork. If you have a specific
              container in mind, describe it below and we will schedule a consult.
            </p>
            <p className="mt-3 text-sm text-foreground">
              Fee: <strong>₦{DESIGN_SERVICE_FEE.toLocaleString()}</strong>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Paid only from your <strong className="text-foreground">Design Credit</strong> signup bonus
              (not your Business Wallet). Design Credit can only be used for Verveo designers.
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Your Design Credit: ₦{designCredit.toLocaleString()}
              {!canAfford && (
                <span className="ml-2 text-amber-500">
                  — shortfall ₦{(DESIGN_SERVICE_FEE - designCredit).toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-5">
        <label className="block text-sm font-medium text-muted-foreground">
          Container / design goals
          <textarea
            required
            minLength={10}
            rows={4}
            value={containerDescription}
            onChange={(e) => setContainerDescription(e.target.value)}
            placeholder="Describe the container you have in mind, materials, sizes, branding goals…"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-muted-foreground">Preferred contact</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CONTACT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm',
                  preferredContact === opt.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground'
                )}
              >
                <input
                  type="radio"
                  name="preferredContact"
                  value={opt.value}
                  checked={preferredContact === opt.value}
                  onChange={() => setPreferredContact(opt.value)}
                  className="accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-muted-foreground">
          Contact detail ({contactMeta.label})
          <input
            required
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={contactMeta.placeholder}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-muted-foreground">
            Preferred date
            <input
              required
              type="date"
              value={scheduledDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
            />
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Preferred time
            <input
              required
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !canAfford}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Booking…
            </>
          ) : (
            <>Book consult — ₦{DESIGN_SERVICE_FEE.toLocaleString()} from Design Credit</>
          )}
        </button>
      </form>
    </div>
  );
}

export function DesignModeChoice({
  onChooseDiy,
  onChoosePro,
}: {
  onChooseDiy: () => void;
  onChoosePro: () => void;
}) {
  const { user } = useAuth();
  const designCredit = user?.designCredit ?? 0;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center gap-6 p-4 md:p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">How do you want to design?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Design the packaging yourself in the studio, or book Verveo designers to craft the container
          with you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={onChooseDiy}
          className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <Palette className="size-8 text-primary" />
          <h3 className="mt-4 text-lg font-bold text-foreground">Design it yourself</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload artwork, pick colors, and preview on a 3D container in the Design Studio.
          </p>
          <span className="mt-4 text-sm font-semibold text-primary group-hover:underline">
            Open studio →
          </span>
        </button>

        <button
          type="button"
          onClick={onChoosePro}
          className="group flex flex-col items-start rounded-2xl border-2 border-primary bg-primary/10 p-6 text-left transition-colors hover:bg-primary/15"
        >
          <Sparkles className="size-8 text-primary" />
          <h3 className="mt-4 text-lg font-bold text-foreground">Verveo Pro Design Team</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Book a consult (video, WhatsApp, email, or phone). We design the <strong className="text-foreground">container itself</strong>, not just the advert.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Uses your ₦{(DESIGN_SERVICE_FEE).toLocaleString()} Design Credit signup bonus only.
            Balance: ₦{designCredit.toLocaleString()}
          </p>
          <span className="mt-4 text-sm font-semibold text-primary group-hover:underline">
            Book designers →
          </span>
        </button>
      </div>
    </div>
  );
}
