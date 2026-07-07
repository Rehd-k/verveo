'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  Camera,
  LayoutDashboard,
  LogOut,
  Radar,
  Settings2,
  X,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useAuth } from '@/store/authStore';
import type { Retailer } from '@/types';

const LINKS = [
  { href: '/retailer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/retailer/stock', label: 'Stock', icon: Boxes },
  { href: '/retailer/campaigns', label: 'Campaigns', icon: BarChart3 },
  { href: '/retailer/proofs', label: 'Proofs', icon: Camera },
  { href: '/retailer/settings', label: 'Settings', icon: Settings2 },
];

interface RetailerSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  profile?: Retailer | null;
}

export default function RetailerSidebar({
  mobileOpen = false,
  onClose,
  profile,
}: RetailerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const content = (
    <>
      <div>
        <div className="flex items-center justify-between px-2">
          <Link href="/retailer/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-blue-400">
              <Radar className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Addizi</p>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Partner Portal</p>
            </div>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {profile && (profile.status === 'pending' || profile.status === 'suspended') && (
          <div className="mt-4 px-2">
            <StatusBadge status={profile.status} />
          </div>
        )}

        <nav className="mt-8 space-y-2">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'border border-primary/30 bg-primary/10 text-white'
                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-4">
        <div className="px-2">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-text-secondary">Retail Partner</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-white/10 bg-card-dark px-4 py-5 text-white md:flex">
        {content}
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
            aria-label="Close menu overlay"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-white/10 bg-card-dark px-4 py-5 text-white md:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
