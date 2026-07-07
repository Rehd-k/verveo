import { clsx } from 'clsx';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}

export function AdminStatCard({ label, value, sub, icon }: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-card-dark p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-text-secondary">{sub}</p>}
        </div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
    </div>
  );
}
