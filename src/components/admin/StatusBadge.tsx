const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-warning/15 text-warning border-warning/30',
  processing: 'bg-primary/15 text-primary border-primary/30',
  printing: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  dispatched: 'bg-warning/15 text-warning border-warning/30',
  live: 'bg-success/15 text-success border-success/30',
  completed: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-warning/15 text-warning border-warning/30',
  active: 'bg-success/15 text-success border-success/30',
  suspended: 'bg-destructive/15 text-destructive border-destructive/30',
  fulfilled: 'bg-success/15 text-success border-success/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  paid: 'bg-success/15 text-success border-success/30',
  failed: 'bg-destructive/15 text-destructive border-destructive/30',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  advertiser: 'bg-primary/15 text-primary border-primary/30',
  retailer: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  admin: 'bg-primary/15 text-primary border-primary/30',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || 'bg-muted text-muted-foreground border-border'
      }`}
    >
      {status}
    </span>
  );
}
