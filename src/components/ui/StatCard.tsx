import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              'mt-1.5 truncate text-lg font-bold sm:text-2xl',
              valueClassName
            )}
          >
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        {icon && <div className="shrink-0 text-primary">{icon}</div>}
      </div>
    </div>
  );
}
