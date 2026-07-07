interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-surface-dark/90 px-4 py-3 backdrop-blur">
      <p className="text-xs text-white/60">{label}</p>
      <p className={`text-lg font-bold ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-white/50">{sub}</p>}
    </div>
  );
}
