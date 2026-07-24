'use client';

import { useAuth } from '@/store/authStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Boxes,
  CreditCard,
  Store,
  ScanLine,
  ImageIcon,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/orders', label: 'Orders', icon: CreditCard },
  { href: '/admin/retailers', label: 'Retailers', icon: Store },
  { href: '/admin/stock-orders', label: 'Stock Orders', icon: Boxes },
  { href: '/admin/scans', label: 'Scans', icon: ScanLine },
  { href: '/admin/proofs', label: 'Proofs', icon: ImageIcon },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, initialized } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.push('/auth/login?redirect=/admin');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, initialized, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!initialized || !user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <div>
            <p className="text-sm font-bold">Verveo Admin</p>
            <p className="text-[10px] uppercase tracking-wider text-text-secondary">Control Center</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              pathname === href || (href !== '/admin' && pathname.startsWith(href))
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/5 p-3 space-y-1">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          War Room
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Log Out
        </button>
        <div className="px-3 py-2">
          <p className="truncate text-xs font-medium text-white">{user.name}</p>
          <p className="truncate text-[10px] text-text-secondary">{user.email}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background-dark font-display text-white">
      <div className="flex">
        <aside className="fixed z-40 hidden h-screen w-56 flex-col border-r border-white/5 bg-card-dark md:flex">
          {sidebarContent}
        </aside>

        {mobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu overlay"
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-white/5 bg-card-dark md:hidden">
              {sidebarContent}
            </aside>
          </>
        )}

        <main className="min-h-screen flex-1 md:ml-56">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-background-dark/95 px-4 py-3 backdrop-blur md:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-white/80 hover:bg-white/5 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-sm font-semibold text-white/90">Platform Administration</h1>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
