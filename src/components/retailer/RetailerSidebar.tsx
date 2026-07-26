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
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
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
              <Radar className="size-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sidebar-foreground">Verveo</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Partner Portal
              </p>
            </div>
          </Link>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 md:hidden"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {profile && (profile.status === 'pending' || profile.status === 'suspended') && (
          <div className="mt-4 px-2">
            <StatusBadge status={profile.status} />
          </div>
        )}

        <nav className="mt-8 space-y-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'border border-primary/30 bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-sidebar-border pt-4">
        <div className="px-2">
          <ThemeToggle className="w-full justify-center" />
        </div>
        <div className="px-2">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">Retail Partner</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground md:flex">
        {content}
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-overlay md:hidden"
            onClick={onClose}
            aria-label="Close menu overlay"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col justify-between border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground md:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
