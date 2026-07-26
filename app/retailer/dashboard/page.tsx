'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Boxes, Camera, Loader2, Megaphone } from 'lucide-react';
import RetailerPageHeader from '@/components/retailer/RetailerPageHeader';
import { useRetailerShell } from '@/components/retailer/RetailerShellContext';
import RetailerStats from '@/components/retailer/RetailerStats';
import StockManager from '@/components/retailer/StockManager';
import OrderHistoryTable from '@/components/retailer/OrderHistoryTable';
import ProofGalleryCard from '@/components/retailer/ProofGalleryCard';
import { useRetailer } from '@/store/retailerStore';

export default function RetailerDashboardPage() {
  const { toggleMobile } = useRetailerShell();
  const { profile, stock, orders, campaigns, proofs, loading, refreshAll } = useRetailer();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  if (loading && !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingProofs = proofs.filter((p) => p.status === 'pending').length;
  const allowance = stock?.allowance ?? profile?.allowance ?? 0;
  const currentStock = stock?.currentStock ?? profile?.currentStock ?? 0;

  return (
    <div>
      <RetailerPageHeader
        title="Partner Dashboard"
        description="Track stock, campaigns, and proof submissions for your venue."
        onMenuClick={toggleMobile}
      />

      <div className="space-y-6 p-4 md:p-8">
        {profile?.status === 'pending' && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Your account is awaiting admin approval. You can view your dashboard, but stock requests and proof uploads are disabled until activated.
          </div>
        )}

        {profile?.status === 'suspended' && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Your account has been suspended. Contact your administrator for assistance.
          </div>
        )}

        <RetailerStats
          allowance={allowance}
          currentStock={currentStock}
          activeCampaigns={campaigns.length}
          pendingProofs={pendingProofs}
        />

        <StockManager allowance={allowance} currentStock={currentStock} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/retailer/stock"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30"
          >
            <Boxes className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Manage stock</p>
              <p className="text-xs text-muted-foreground">Request branded packs</p>
            </div>
          </Link>
          <Link
            href="/retailer/campaigns"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30"
          >
            <Megaphone className="size-5 text-primary" />
            <div>
              <p className="font-semibold">View campaigns</p>
              <p className="text-xs text-muted-foreground">{campaigns.length} matched to your venue</p>
            </div>
          </Link>
          <Link
            href="/retailer/proofs"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30"
          >
            <Camera className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Submit proofs</p>
              <p className="text-xs text-muted-foreground">{pendingProofs} pending review</p>
            </div>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Recent stock orders</h2>
            <OrderHistoryTable orders={orders} compact />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Recent proofs</h2>
            {proofs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                No proofs submitted yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {proofs.slice(0, 2).map((proof) => (
                  <ProofGalleryCard key={proof.id || proof._id} proof={proof} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
