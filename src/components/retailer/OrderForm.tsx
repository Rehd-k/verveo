'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { authHeaders } from '@/lib/fetchAuth';

interface OrderFormProps {
  onCreated: () => void;
}

export default function OrderForm({ onCreated }: OrderFormProps) {
  const [quantity, setQuantity] = useState(500);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/retailer/stock/orders', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ quantity, notes }),
      });

      if (!res.ok) throw new Error('Request failed');
      toast.success('Stock request submitted');
      setNotes('');
      onCreated();
    } catch {
      toast.error('Failed to request stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Request more stock</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell operations how many branded packs your venue needs next.
      </p>

      <label className="mt-5 block text-sm font-medium text-muted-foreground">
        Quantity
        <input
          type="number"
          min={1}
          max={10000}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-muted-foreground">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
          placeholder="Preferred delivery window, campaign details, or packaging needs."
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-blue-600 disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit request'}
      </button>
    </form>
  );
}
