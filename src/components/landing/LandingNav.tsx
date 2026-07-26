'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radar, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const NAV_LINKS = [
  { href: '#why-verveo', label: 'Why Verveo' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#analytics', label: 'Analytics' },
  { href: '#reach', label: 'Reach' },
  { href: '/partners', label: 'For Partners' },
  { href: '#faq', label: 'FAQ' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-background py-3 text-foreground'
          : 'bg-transparent py-5 text-white'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400">
            <Radar className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display truncate text-lg font-bold tracking-tight">Verveo</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                scrolled
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex lg:gap-3">
          <ThemeToggle compact />
          <Link
            href="/auth/login"
            className={`text-sm font-medium transition-colors ${
              scrolled
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Start a Campaign
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            className={`flex size-10 items-center justify-center rounded-lg border ${
              scrolled ? 'border-border bg-card' : 'border-white/20 bg-white/10'
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 text-foreground sm:px-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Start a Campaign
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
