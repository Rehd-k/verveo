interface StockManagerProps {
  allowance: number;
  currentStock: number;
}

export default function StockManager({ allowance, currentStock }: StockManagerProps) {
  const usedStock = Math.max(0, allowance - currentStock);
  const percent = allowance > 0 ? Math.min(100, Math.round((currentStock / allowance) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Stock health</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track available branded packs and request more before you run out.
          </p>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {percent}% available
        </span>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-card/10">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Allowance</p>
          <p className="mt-1 text-xl font-bold">{allowance.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current stock</p>
          <p className="mt-1 text-xl font-bold">{currentStock.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Used stock</p>
          <p className="mt-1 text-xl font-bold">{usedStock.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
