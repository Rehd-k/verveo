'use client';

import { useAuth } from '@/store/authStore';
import { useCampaign } from '@/store/campaignStore';
import {
  Radar,
  LayoutDashboard,
  Megaphone,
  ChartLine,
  CreditCard,
  Settings2,
  LogOut,
  CirclePlus,
  Bell,
  Settings,
  User,
  Shield,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell, ShellNavItem } from '@/components/layout/AppShell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/Button';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone, match: (p: string) => p.startsWith('/campaigns') || p.startsWith('/campaign') },
  { href: '/analytics', label: 'Analytics', icon: ChartLine, match: (p: string) => p === '/analytics' },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet, match: (p: string) => p.startsWith('/dashboard/wallet') },
  { href: '/settings', label: 'Billing', icon: CreditCard, match: (p: string) => p === '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, initialized } = useAuth();
  const pathname = usePathname();
  const { fetchCampaigns } = useCampaign();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role === 'retailer') {
      router.push('/retailer/dashboard');
      return;
    }

    fetchCampaigns(user.id || '');
    setLoading(false);
  }, [user, initialized, router, fetchCampaigns]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!initialized || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const brand = (
    <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400 shadow-lg shadow-primary/20">
        <Radar className="size-4 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight">Verveo</p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          War Room
        </p>
      </div>
    </Link>
  );

  const nav = (
    <>
      {NAV.map(({ href, label, icon: Icon, match }) => (
        <ShellNavItem
          key={href}
          href={href}
          label={label}
          icon={<Icon />}
          active={match(pathname)}
          onClick={() => setMobileOpen(false)}
        />
      ))}
      {user.role === 'admin' && (
        <ShellNavItem
          href="/admin"
          label="Admin Panel"
          icon={<Shield />}
          active={pathname.startsWith('/admin')}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="pt-2">
        <Link
          href="/campaign"
          onClick={() => setMobileOpen(false)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:brightness-110"
        >
          <CirclePlus className="size-4" />
          Create Campaign
        </Link>
      </div>
    </>
  );

  const footer = (
    <>
      <ShellNavItem
        href="/dashboard/settings"
        label="Settings"
        icon={<Settings2 />}
        active={pathname === '/dashboard/settings'}
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
        <p className="truncate text-[10px] text-muted-foreground">
          {user.role === 'admin' ? 'Admin' : 'Advertiser'}
        </p>
      </div>
    </>
  );

  return (
    <AppShell
      brand={brand}
      nav={nav}
      footer={footer}
      headerTitle="War Room"
      mobileOpen={mobileOpen}
      onMobileOpenChange={setMobileOpen}
      headerActions={
        <>
          <ThemeToggle compact />
          <Button variant="ghost" size="icon" className="size-9" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <Link
            href="/dashboard/settings"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Link>
          <Link
            href="/dashboard/settings"
            className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-label="Profile"
          >
            <User className="size-4" />
          </Link>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
