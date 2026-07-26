'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import RetailerPageHeader from '@/components/retailer/RetailerPageHeader';
import { useRetailerShell } from '@/components/retailer/RetailerShellContext';
import StockManager from '@/components/retailer/StockManager';
import OrderForm from '@/components/retailer/OrderForm';
import OrderHistoryTable from '@/components/retailer/OrderHistoryTable';
import { useRetailer } from '@/store/retailerStore';

export default function RetailerStockPage() {
  const { toggleMobile } = useRetailerShell();
  const { profile, stock, orders, loading, refreshAll, fetchOrders } = useRetailer();

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

  const allowance = stock?.allowance ?? profile?.allowance ?? 0;
  const currentStock = stock?.currentStock ?? profile?.currentStock ?? 0;
  const canOrder = profile?.status === 'active';

  return (
    <div>
      <RetailerPageHeader
        title="Stock Management"
        description="Monitor inventory and request branded packaging for your venue."
        onMenuClick={toggleMobile}
      />

      <div className="space-y-6 p-4 md:p-8">
        {!canOrder && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {profile?.status === 'suspended'
              ? 'Your account is suspended. Stock requests are disabled.'
              : 'Stock requests are available after your account is activated by an admin.'}
          </div>
        )}

        <StockManager allowance={allowance} currentStock={currentStock} />

        <div className="grid gap-6 lg:grid-cols-2">
          {canOrder ? (
            <OrderForm onCreated={() => fetchOrders()} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Stock requests will unlock once your partner account is active.
            </div>
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Order history</h2>
            <OrderHistoryTable orders={orders} />
          </div>
        </div>
      </div>
    </div>
  );
}
