import { StatusBadge } from '@/components/admin/StatusBadge';
import type { StockOrder } from '@/types';

interface OrderHistoryTableProps {
  orders: StockOrder[];
  compact?: boolean;
}

function formatDate(value?: Date | string) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OrderHistoryTable({ orders, compact }: OrderHistoryTableProps) {
  const rows = compact ? orders.slice(0, 5) : orders;

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No stock orders yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-card text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Quantity</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
            {!compact && <th className="px-4 py-3 font-medium">Notes</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.id || order._id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">
                {order.quantity.toLocaleString()} packs
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(order.fulfilledAt || order.createdAt)}
              </td>
              {!compact && (
                <td className="px-4 py-3 text-muted-foreground">
                  {order.notes || '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
