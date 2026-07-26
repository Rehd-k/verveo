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
} from 'lucide-react';
import { AppShell, ShellNavItem } from '@/components/layout/AppShell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const brand = (
    <div className="flex items-center gap-2">
      <Shield className="size-5 text-primary" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">Verveo Admin</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Control Center
        </p>
      </div>
    </div>
  );

  const nav = NAV.map(({ href, label, icon: Icon, exact }) => (
    <ShellNavItem
      key={href}
      href={href}
      label={label}
      icon={<Icon />}
      active={exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)}
      onClick={() => setMobileOpen(false)}
    />
  ));

  const footer = (
    <>
      <ShellNavItem
        href="/dashboard"
        label="War Room"
        icon={<ArrowLeft />}
        onClick={() => setMobileOpen(false)}
      />
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <LogOut className="size-4" />
        Log Out
      </button>
      <div className="px-3 py-2">
        <p className="truncate text-xs font-medium">{user.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
      </div>
    </>
  );

  return (
    <AppShell
      brand={brand}
      nav={nav}
      footer={footer}
      headerTitle="Platform Administration"
      mobileOpen={mobileOpen}
      onMobileOpenChange={setMobileOpen}
      headerActions={<ThemeToggle compact />}
    >
      {children}
    </AppShell>
  );
}
