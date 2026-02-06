'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { name: 'Campaigns', icon: 'campaign', href: '/campaign/location' }, // Pointing to start of wizard for demo
    { name: 'Analytics', icon: 'bar_chart', href: '/analytics' },
    { name: 'Billing', icon: 'credit_card', href: '/billing' },
  ];

  return (
    <aside className="w-64 bg-card-dark border-r border-border-dark flex flex-col justify-between shrink-0 h-screen z-20">
      <div className="flex flex-col gap-6 p-4">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-linear-to-tr from-primary-blue to-blue-400 size-10 rounded-lg flex items-center justify-center shadow-lg shadow-primary-blue/20">
            <span className="material-symbols-outlined text-white text-2xl">radar</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold tracking-tight">AdPlatform</h1>
            <p className="text-text-dim text-xs font-medium uppercase tracking-wider">War Room</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary-blue/10 border-l-2 border-primary-blue text-white" 
                    : "text-text-dim hover:text-white hover:bg-white/5"
                )}
              >
                <span className={clsx("material-symbols-outlined", isActive ? "text-primary-blue" : "")}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="flex flex-col p-4 gap-4">
        <button className="w-full flex items-center justify-center gap-2 bg-primary-blue hover:bg-blue-600 transition-colors text-white h-10 rounded-lg font-semibold text-sm shadow-lg shadow-primary-blue/20">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Campaign
        </button>
        <div className="flex items-center gap-3 px-2 pb-2 border-t border-border-dark pt-4">
          <div className="size-8 rounded-full bg-cover bg-center ring-2 ring-white/10" style={{ backgroundImage: "url('/assets/avatar.jpg')" }}></div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">Alex Johnson</span>
            <span className="text-xs text-text-dim truncate">Advertiser Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}