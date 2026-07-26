'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

interface AppShellProps {
  brand: ReactNode;
  nav: ReactNode;
  footer?: ReactNode;
  headerTitle?: string;
  headerActions?: ReactNode;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  children: ReactNode;
  sidebarClassName?: string;
}

export function AppShell({
  brand,
  nav,
  footer,
  headerTitle,
  headerActions,
  mobileOpen,
  onMobileOpenChange,
  children,
  sidebarClassName,
}: AppShellProps) {
  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4">
        <div className="min-w-0 flex-1">{brand}</div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 md:hidden"
          onClick={() => onMobileOpenChange(false)}
          aria-label="Close menu"
        >
          <X className="size-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">{nav}</nav>
      {footer && (
        <div className="border-t border-sidebar-border p-3 space-y-1">{footer}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      <div className="flex">
        <aside
          className={cn(
            'fixed z-40 hidden h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex',
            sidebarClassName
          )}
        >
          {sidebarInner}
        </aside>

        {mobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-overlay md:hidden"
              onClick={() => onMobileOpenChange(false)}
              aria-label="Close menu overlay"
            />
            <aside
              className={cn(
                'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden',
                sidebarClassName
              )}
            >
              {sidebarInner}
            </aside>
          </>
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-56">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background px-4 py-3 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 md:hidden"
              onClick={() => onMobileOpenChange(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            {headerTitle && (
              <h1 className="min-w-0 truncate text-sm font-semibold text-foreground">
                {headerTitle}
              </h1>
            )}
            {headerActions && (
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {headerActions}
              </div>
            )}
          </header>
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function ShellNavItem({
  href,
  label,
  icon,
  active,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
        active
          ? 'border-l-2 border-primary bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <span className="shrink-0 [&_svg]:size-4">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
