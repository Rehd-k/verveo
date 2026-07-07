'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authHeaders } from '@/lib/fetchAuth';
import { ProofReviewCard } from '@/components/admin/ProofReviewCard';
import type { Proof } from '@/types';

export default function AdminProofsPage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  const load = () => {
    const qs = new URLSearchParams();
    if (statusFilter) qs.set('status', statusFilter);
    fetch(`/api/admin/proofs?${qs}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setProofs(d.proofs))
      .catch(() => toast.error('Failed to load proofs'));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const review = async (id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/proofs/${id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Proof ${status}`);
      load();
    } catch {
      toast.error('Review failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Proof of Placement</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>
      {proofs.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-card-dark p-8 text-center text-text-secondary">
          No proofs in this queue
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proofs.map((proof) => (
            <ProofReviewCard
              key={proof.id || proof._id}
              proof={proof}
              loading={loading}
              onApprove={() => review(proof.id || proof._id || '', 'approved')}
              onReject={() => review(proof.id || proof._id || '', 'rejected')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
