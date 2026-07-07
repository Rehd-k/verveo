const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  printing: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  dispatched: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  live: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  completed: 'bg-white/10 text-white/60 border-white/20',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  suspended: 'bg-red-500/15 text-red-300 border-red-500/30',
  fulfilled: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
  paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  failed: 'bg-red-500/15 text-red-300 border-red-500/30',
  approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
  advertiser: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  retailer: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  admin: 'bg-primary/15 text-primary border-primary/30',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || 'bg-white/10 text-white/60 border-white/20'
      }`}
    >
      {status}
    </span>
  );
}
