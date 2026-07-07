import Link from 'next/link';
import { Radar } from 'lucide-react';

const FOOTER_LINKS = [
  { href: '#why-addizi', label: 'Why Addizi' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#analytics', label: 'Analytics' },
  { href: '#faq', label: 'FAQ' },
  { href: '/partners', label: 'For Partners' },
  { href: '/auth/login', label: 'Sign in' },
  { href: '/auth/signup?role=advertiser', label: 'Sign up' },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/40 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400">
              <Radar className="size-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">Addizi</span>
          </div>
          <p className="max-w-xs text-sm text-white/50">
            Physical advertising with digital precision. Built for advertisers who demand measurable
            results across Nigeria.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/5 pt-6 text-center text-xs text-white/40 md:text-left">
        &copy; {new Date().getFullYear()} Addizi. All rights reserved.
      </div>
    </footer>
  );
}
