'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { name: 'Campaigns', icon: 'campaign', href: '/campaign/location' },
    { name: 'Analytics', icon: 'bar_chart', href: '/analytics' },
    { name: 'Billing', icon: 'credit_card', href: '/settings' },
  ];

  return (
    <aside className="z-20 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl text-primary-foreground">radar</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight">Verveo</h1>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              War Room
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
