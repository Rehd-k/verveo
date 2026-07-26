import type { ReactNode } from 'react';
import { StatCard } from '@/components/ui/StatCard';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}

export function AdminStatCard({ label, value, sub, icon }: AdminStatCardProps) {
  return <StatCard label={label} value={value} sub={sub} icon={icon} />;
}
